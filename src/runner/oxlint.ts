import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { text } from "node:stream/consumers";
import type { Project } from "typescript/unstable/sync";

import type { ImportIssue } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup, allOrError } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { compileOxlintConfig, type FixGuard } from "./compileOxlintConfig.js";
import { isError, type Finding } from "./findings.js";
import { parseOxlintOutput } from "./oxlintDiagnostics.js";

/**
 * Characters of file paths per lint run. Command lines have OS limits (about 32k characters on Windows),
 * and every run loads the TypeScript project again, so runs are as large as the limit allows.
 */
const pathCharactersPerRun = process.platform === "win32" ? 24_000 : 200_000;

const requireFromPackage = createRequire(import.meta.url);
const oxlint = join(dirname(requireFromPackage.resolve("oxlint/package.json")), "bin/oxlint");

/**
 * The type-aware engine's native binary, from this package's own dependency. The lint engine otherwise looks for it
 * in the project's node_modules/.bin, where package managers such as pnpm do not link a dependency's dependencies.
 */
const typeAwareEngine = (): string | undefined => {
  const fromEngine = tryCatch(() => createRequire(requireFromPackage.resolve("oxlint-tsgolint/package.json")));
  // architecture-disable-next-line no-discarded-errors -- Not finding the engine here is expected; the lint engine then looks for it itself.
  if (fromEngine instanceof ArchitectureError) return undefined;
  const executable = `@oxlint-tsgolint/${process.platform}-${process.arch}/tsgolint${process.platform === "win32" ? ".exe" : ""}`;
  const resolved = tryCatch(() => fromEngine.resolve(executable));
  // architecture-disable-next-line no-discarded-errors -- A platform without a prebuilt engine falls back to the lint engine's own lookup.
  return resolved instanceof ArchitectureError ? undefined : resolved;
};

const engineEnvironment = (): NodeJS.ProcessEnv => {
  const binary = process.env.OXLINT_TSGOLINT_PATH ?? typeAwareEngine();
  return binary === undefined ? process.env : { ...process.env, OXLINT_TSGOLINT_PATH: binary };
};

const exitCode = async (child: ChildProcess): Promise<number | ArchitectureError> => new Promise((finish) => {
  child.on("error", (error) => {
    finish(new ArchitectureError([`The lint engine could not start: ${error.message}`], { cause: error }));
  });
  child.on("close", (code) => {
    finish(code ?? 1);
  });
});

const failureDetail = (errors: string): string => {
  const detail = errors.trim();
  return detail.length === 0 ? "" : `: ${detail.slice(0, 500)}`;
};

/** Runs the lint engine once and returns its findings. A non-zero exit without an error finding means the engine itself failed. */
const execute = async (root: string, args: readonly string[]): Promise<readonly Finding[] | ArchitectureError> => {
  const child = spawn(process.execPath, [oxlint, ...args], { cwd: root, stdio: ["ignore", "pipe", "pipe"], env: engineEnvironment() });
  const [output, errors, code] = await Promise.all([text(child.stdout), text(child.stderr), exitCode(child)]);
  if (code instanceof ArchitectureError) return code;
  const findings = parseOxlintOutput(root, output);
  if (findings instanceof ArchitectureError) return new ArchitectureError([...findings.issues.map((issue) => `${issue}${failureDetail(errors)}`)]);
  const isToolFailure = code !== 0 && !findings.some(isError);
  if (isToolFailure) return new ArchitectureError([`The lint engine exited with code ${code} without reporting an error${failureDetail(errors)}`]);
  return findings;
};

const chunks = <Value>(values: readonly Value[], size: number): readonly (readonly Value[])[] => {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
};

/** Splits files into runs whose paths fit within pathCharactersPerRun, sized by the longest path. */
const batches = (files: readonly ClassifiedFile[]): readonly (readonly ClassifiedFile[])[] => {
  const longest = Math.max(1, ...files.map((file) => file.path.length + 1));
  return chunks(files, Math.max(1, Math.floor(pathCharactersPerRun / longest)));
};

const oxlintArguments = (configPath: string, project: Project, files: readonly ClassifiedFile[], fix: boolean): readonly string[] => [
  "--config", configPath, "--disable-nested-config", "--no-ignore", "--type-aware", "--tsconfig", project.configFileName,
  "--format", "json", ...(fix ? ["--fix"] : []), ...files.map((file) => file.path),
];

/** Runs each invocation in turn, so --fix runs never race, and keeps every run's findings. */
const runInTurn = async (
  root: string, invocations: readonly (readonly string[])[], done: readonly (readonly Finding[] | ArchitectureError)[],
): Promise<readonly Finding[] | ArchitectureError> => {
  const [args, ...rest] = invocations;
  if (args === undefined) {
    const runs = allOrError(done);
    return runs instanceof ArchitectureError ? runs : runs.flat();
  }
  const findings = await execute(root, args);
  return runInTurn(root, rest, [...done, findings]);
};

/** Lints each project's files with every file's policy: one run per project unless its paths exceed the command-line budget. */
const runOxlint = async (
  root: string, configPath: string, files: readonly ClassifiedFile[], projects: readonly Project[], fix: boolean,
): Promise<readonly Finding[] | ArchitectureError> => {
  // A package imported by several projects is in each of their programs; lint it once, in the first that holds it.
  const ownerOf = (file: ClassifiedFile): Project | undefined => projects.find((project) => project.program.getSourceFile(file.path) !== undefined);
  const invocations = projects.flatMap((project) => {
    const projectFiles = files.filter((file) => ownerOf(file) === project);
    return batches(projectFiles).map((batch) => oxlintArguments(configPath, project, batch, fix));
  });
  return runInTurn(root, invocations, []);
};

/**
 * Lints the files through a generated config in a private directory inside the root, where the
 * engine's relative globs resolve. The directory is created after inventory and always removed.
 */
export const lint = async (
  root: string, files: readonly ClassifiedFile[], imports: readonly ImportIssue[], projects: readonly Project[], fix: FixGuard | undefined,
): Promise<readonly Finding[] | ArchitectureError> => {
  if (files.length === 0) return [];
  const directory = tryCatch(() => mkdtempSync(join(root, ".architecture-run-")));
  if (directory instanceof ArchitectureError) return directory;
  const configPath = join(directory, "oxlint.json");
  const outcome = await tryCatchAsync(async () => {
    writeFileSync(configPath, JSON.stringify(compileOxlintConfig(files, imports, fix)));
    return runOxlint(root, configPath, files, projects, fix !== undefined);
  });
  const cleanup = tryCatch(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return afterCleanup(outcome, cleanup);
};
