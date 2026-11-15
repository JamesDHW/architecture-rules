import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { matches } from "../analysis/paths.js";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { compileDeadCodeConfig, isEntryFile } from "./compileDeadCodeConfig.js";
import { run } from "./deadCodeEngine.js";
import { devDependencyMessage, exportRules, message, projectRules, ruleByIssueType } from "./deadCodeReports.js";
/** Exports something outside the program uses, by the file's layer entry setting. */
const isEntryExport = (file, name) => {
    const exports = file.policy.entry?.exports;
    const isNamingEntry = exports !== undefined && isEntryFile(file);
    if (!isNamingEntry)
        return false;
    return exports === "all" || exports.includes(name);
};
const isExemptExport = (file, ruleId, name) => {
    if (!exportRules.has(ruleId))
        return false;
    return file.policy.generated !== undefined || isEntryExport(file, name);
};
const isReported = (context, ruleId, report) => {
    if (projectRules.has(ruleId))
        return true;
    const file = context.byPath.get(report.file);
    // Only the checked programs' source counts; the engine also reads package.json entry targets such as dist/.
    if (file === undefined)
        return false;
    return !isExemptExport(file, ruleId, report.name);
};
/** From the run that counts entry exports as unused: only exports in entry files whose layer names its used exports. */
const isNamedEntryExport = (context, report) => {
    const file = context.byPath.get(report.file);
    const exports = file?.policy.entry?.exports;
    const isListedEntry = file !== undefined && isEntryFile(file) && exports !== "all";
    return isListedEntry && exportRules.has(ruleByIssueType[report.type] ?? "");
};
const settingFor = (context, ruleId, file) => {
    const layerRules = context.byPath.get(file)?.policy.rules;
    return layerRules?.[ruleId] ?? context.architecture.defaults.rules[ruleId];
};
const keyOf = (ruleId, report) => `${ruleId}:${report.file}:${report.name}`;
const classify = (context, reports) => {
    return reports.flatMap((report) => {
        const ruleId = ruleByIssueType[report.type];
        const isKnown = ruleId !== undefined && isReported(context, ruleId, report);
        return isKnown ? [{ ruleId, report }] : [];
    });
};
/** Default-mode findings, then what only production mode adds: code used only by development layers, and devDependencies in production code. */
const combine = (context, everything, production) => {
    const all = classify(context, everything);
    const seen = new Set(all.map(({ ruleId, report }) => keyOf(ruleId, report)));
    const productionOnly = classify(context, production).filter(({ ruleId, report }) => !seen.has(keyOf(ruleId, report)));
    return [
        ...all.map(({ ruleId, report }) => ({ ruleId, report, message: message(ruleId, report, false) })),
        ...productionOnly.flatMap(({ ruleId, report }) => {
            if (ruleId === "unlisted-dependencies")
                return [{ ruleId, report, message: devDependencyMessage(report) }];
            const isCodeFinding = ruleId === "unused-files" || exportRules.has(ruleId);
            return isCodeFinding ? [{ ruleId: "production-reachability", report, message: message(ruleId, report, true) }] : [];
        }),
    ];
};
const allowList = (setting) => {
    const [options] = setting?.options ?? [];
    const allow = isRecord(options) ? options.allow : undefined;
    return isUnknownArray(allow) ? allow.filter(isString) : [];
};
/** This package is used by architecture.config.ts and its own command, which the analysis does not see. */
const checkerPackage = "architecture-rules";
const isAllowed = (context, entry) => {
    if (!projectRules.has(entry.ruleId))
        return false;
    const isChecker = entry.ruleId === "unused-dependencies" && entry.report.name === checkerPackage;
    return isChecker || matches(entry.report.name, allowList(context.architecture.defaults.rules[entry.ruleId]));
};
/** An allow-list entry that matched nothing is dead configuration too. */
const unusedAllowances = (context, entries) => [...projectRules].flatMap((ruleId) => {
    const allow = allowList(context.architecture.defaults.rules[ruleId]);
    const names = entries.filter((entry) => entry.ruleId === ruleId).map((entry) => entry.report.name);
    return allow.filter((pattern) => !names.some((name) => matches(name, [pattern]))).map((pattern) => ({
        source: "dead-code", severity: "error", ruleId, file: context.configFile,
        message: `${ruleId} allows ${pattern}, but nothing needs that allowance. Remove it.`,
    }));
});
const toFinding = (context, entry) => {
    const setting = settingFor(context, entry.ruleId, entry.report.file);
    const isOff = setting === undefined || setting.severity === "off";
    if (isOff)
        return [];
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
const writeConfig = (directory, name, config) => {
    const path = join(directory, name);
    writeFileSync(path, JSON.stringify(config));
    return path;
};
/**
 * Three runs: everything and production only, where entry exports count as used, so public APIs re-exported from
 * an entry stay alive; and everything again with entry exports counted, for entries that name their used exports.
 */
const runAll = async (root, directory, files, context) => {
    const publicEntries = writeConfig(directory, "dead-code.json", compileDeadCodeConfig(files, false));
    const countedEntries = writeConfig(directory, "dead-code-entries.json", compileDeadCodeConfig(files, true));
    const [everything, production, entries] = await Promise.all([run(root, publicEntries, false), run(root, publicEntries, true), run(root, countedEntries, false)]);
    if (everything instanceof ArchitectureError)
        return everything;
    if (production instanceof ArchitectureError)
        return production;
    if (entries instanceof ArchitectureError)
        return entries;
    return { everything: [...everything, ...entries.filter((report) => isNamedEntryExport(context, report))], production };
};
/**
 * Finds unused files, exports and dependencies from the layers' entries, through generated configurations in a
 * private directory inside the root.
 */
export const deadCode = async (root, architecture, files, configFile) => {
    const directory = tryCatch(() => mkdtempSync(join(root, ".architecture-run-")));
    if (directory instanceof ArchitectureError)
        return directory;
    const context = { architecture, byPath: new Map(files.map((file) => [file.relative, file])), configFile };
    const outcome = await tryCatchAsync(async () => {
        const runs = await runAll(root, directory, files, context);
        if (runs instanceof ArchitectureError)
            return runs;
        const entries = combine(context, runs.everything, runs.production);
        return [...entries.filter((entry) => !isAllowed(context, entry)).flatMap((entry) => toFinding(context, entry)), ...unusedAllowances(context, entries)];
    });
    const cleanup = tryCatch(() => {
        rmSync(directory, { recursive: true, force: true });
    });
    return afterCleanup(outcome, cleanup);
};
//# sourceMappingURL=deadCode.js.map