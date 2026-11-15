import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { text } from "node:stream/consumers";

import type { ClassifiedFile } from "../analysis/inventory.js";
import { matches } from "../analysis/paths.js";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import type { Architecture, EffectiveRule } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { compileDeadCodeConfig, isEntryFile, type DeadCodeConfig } from "./compileDeadCodeConfig.js";
import { devDependencyMessage, exportRules, message, parseReports, projectRules, ruleByIssueType, type Report } from "./deadCodeReports.js";
import type { Finding } from "./findings.js";

const requireFromPackage = createRequire(import.meta.url);

/** The engine's command; its package exports no package.json, so it is found from its main module in dist/. */
const engine = (): string => join(dirname(dirname(requireFromPackage.resolve("knip"))), "bin/knip.js");

const exitCode = async (child: ChildProcess): Promise<number | ArchitectureError> => new Promise((finish) => {
  child.on("error", (error) => {
    finish(new ArchitectureError([`The dead-code analysis could not start: ${error.message}`], { cause: error }));
  });
  child.on("close", (code) => {
    finish(code ?? 1);
  });
});

const run = async (root: string, configPath: string, production: boolean): Promise<readonly Report[] | ArchitectureError> => {
  const args = ["--config", configPath, "--reporter", "json", "--no-progress", "--no-config-hints", "--no-exit-code", ...(production ? ["--production", "--strict"] : [])];
  const child = spawn(process.execPath, [engine(), ...args], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  const [output, errors, code] = await Promise.all([text(child.stdout), text(child.stderr), exitCode(child)]);
  if (code instanceof ArchitectureError) return code;
  if (code !== 0) return new ArchitectureError([`The dead-code analysis exited with code ${code}: ${errors.trim().slice(0, 500)}`]);
  return parseReports(output);
};

type Context = {
  readonly architecture: Architecture;
  readonly byPath: ReadonlyMap<string, ClassifiedFile>;
  readonly configFile: string;
};

/** Exports something outside the program uses, by the file's layer entry setting. */
const isEntryExport = (file: ClassifiedFile, name: string): boolean => {
  const exports = file.policy.entry?.exports;
  const isNamingEntry = exports !== undefined && isEntryFile(file);
  if (!isNamingEntry) return false;
  return exports === "all" || exports.includes(name);
};

const isExemptExport = (file: ClassifiedFile, ruleId: string, name: string): boolean => {
  if (!exportRules.has(ruleId)) return false;
  return file.policy.generated !== undefined || isEntryExport(file, name);
};

const isReported = (context: Context, ruleId: string, report: Report): boolean => {
  if (projectRules.has(ruleId)) return true;
  const file = context.byPath.get(report.file);
  // Only the checked programs' source counts; the engine also reads package.json entry targets such as dist/.
  if (file === undefined) return false;
  return !isExemptExport(file, ruleId, report.name);
};

/** From the run that counts entry exports as unused: only exports in entry files whose layer names its used exports. */
const isNamedEntryExport = (context: Context, report: Report): boolean => {
  const file = context.byPath.get(report.file);
  const exports = file?.policy.entry?.exports;
  const isListedEntry = file !== undefined && isEntryFile(file) && exports !== "all";
  return isListedEntry && exportRules.has(ruleByIssueType[report.type] ?? "");
};

const settingFor = (context: Context, ruleId: string, file: string): EffectiveRule | undefined => {
  const layerRules = context.byPath.get(file)?.policy.rules;
  return layerRules?.[ruleId] ?? context.architecture.defaults.rules[ruleId];
};

type Classified = { readonly ruleId: string; readonly report: Report; readonly message: string };

const keyOf = (ruleId: string, report: Report): string => `${ruleId}:${report.file}:${report.name}`;

const classify = (context: Context, reports: readonly Report[]): readonly { readonly ruleId: string; readonly report: Report }[] => {
  return reports.flatMap((report) => {
    const ruleId = ruleByIssueType[report.type];
    const isKnown = ruleId !== undefined && isReported(context, ruleId, report);
    return isKnown ? [{ ruleId, report }] : [];
  });
};

/** Default-mode findings, then what only production mode adds: code used only by development layers, and devDependencies in production code. */
const combine = (context: Context, everything: readonly Report[], production: readonly Report[]): readonly Classified[] => {
  const all = classify(context, everything);
  const seen = new Set(all.map(({ ruleId, report }) => keyOf(ruleId, report)));
  const productionOnly = classify(context, production).filter(({ ruleId, report }) => !seen.has(keyOf(ruleId, report)));
  return [
    ...all.map(({ ruleId, report }) => ({ ruleId, report, message: message(ruleId, report, false) })),
    ...productionOnly.flatMap(({ ruleId, report }): readonly Classified[] => {
      if (ruleId === "unlisted-dependencies") return [{ ruleId, report, message: devDependencyMessage(report) }];
      const isCodeFinding = ruleId === "unused-files" || exportRules.has(ruleId);
      return isCodeFinding ? [{ ruleId: "production-reachability", report, message: message(ruleId, report, true) }] : [];
    }),
  ];
};

const allowList = (setting: EffectiveRule | undefined): readonly string[] => {
  const [options] = setting?.options ?? [];
  const allow = isRecord(options) ? options.allow : undefined;
  return isUnknownArray(allow) ? allow.filter(isString) : [];
};

const isAllowed = (context: Context, entry: Classified): boolean => {
  if (!projectRules.has(entry.ruleId)) return false;
  return matches(entry.report.name, allowList(context.architecture.defaults.rules[entry.ruleId]));
};

/** An allow-list entry that matched nothing is dead configuration too. */
const unusedAllowances = (context: Context, entries: readonly Classified[]): readonly Finding[] => [...projectRules].flatMap((ruleId) => {
  const allow = allowList(context.architecture.defaults.rules[ruleId]);
  const names = entries.filter((entry) => entry.ruleId === ruleId).map((entry) => entry.report.name);
  return allow.filter((pattern) => !names.some((name) => matches(name, [pattern]))).map((pattern): Finding => ({
    source: "dead-code", severity: "error", ruleId, file: context.configFile,
    message: `${ruleId} allows ${pattern}, but nothing needs that allowance. Remove it.`,
  }));
});

const toFinding = (context: Context, entry: Classified): readonly Finding[] => {
  const setting = settingFor(context, entry.ruleId, entry.report.file);
  const isOff = setting === undefined || setting.severity === "off";
  if (isOff) return [];
  const { report } = entry;
  return [{
    source: "dead-code",
    severity: setting.severity === "warn" ? "warning" : "error",
    ruleId: entry.ruleId,
    file: report.file,
    ...(report.line === undefined ? {} : { line: report.line }),
    ...(report.column === undefined ? {} : { column: report.column }),
    message: entry.message,
  }];
};

const writeConfig = (directory: string, name: string, config: DeadCodeConfig): string => {
  const path = join(directory, name);
  writeFileSync(path, JSON.stringify(config));
  return path;
};

type Runs = { readonly everything: readonly Report[]; readonly production: readonly Report[] };

/**
 * Three runs: everything and production only, where entry exports count as used, so public APIs re-exported from
 * an entry stay alive; and everything again with entry exports counted, for entries that name their used exports.
 */
const runAll = async (root: string, directory: string, files: readonly ClassifiedFile[], context: Context): Promise<Runs | ArchitectureError> => {
  const publicEntries = writeConfig(directory, "dead-code.json", compileDeadCodeConfig(files, false));
  const countedEntries = writeConfig(directory, "dead-code-entries.json", compileDeadCodeConfig(files, true));
  const [everything, production, entries] = await Promise.all([run(root, publicEntries, false), run(root, publicEntries, true), run(root, countedEntries, false)]);
  if (everything instanceof ArchitectureError) return everything;
  if (production instanceof ArchitectureError) return production;
  if (entries instanceof ArchitectureError) return entries;
  return { everything: [...everything, ...entries.filter((report) => isNamedEntryExport(context, report))], production };
};

/**
 * Finds unused files, exports and dependencies from the layers' entries, through generated configurations in a
 * private directory inside the root.
 */
export const deadCode = async (
  root: string, architecture: Architecture, files: readonly ClassifiedFile[], configFile: string,
): Promise<readonly Finding[] | ArchitectureError> => {
  const directory = tryCatch(() => mkdtempSync(join(root, ".architecture-run-")));
  if (directory instanceof ArchitectureError) return directory;
  const context: Context = { architecture, byPath: new Map(files.map((file) => [file.relative, file])), configFile };
  const outcome = await tryCatchAsync(async () => {
    const runs = await runAll(root, directory, files, context);
    if (runs instanceof ArchitectureError) return runs;
    const entries = combine(context, runs.everything, runs.production);
    return [...entries.filter((entry) => !isAllowed(context, entry)).flatMap((entry) => toFinding(context, entry)), ...unusedAllowances(context, entries)];
  });
  const cleanup = tryCatch(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return afterCleanup(outcome, cleanup);
};
