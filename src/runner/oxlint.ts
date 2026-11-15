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
import { compileOxlintConfig } from "./compileOxlintConfig.js";
import { isError, type Finding } from "./findings.js";
import { parseOxlintOutput } from "./oxlintDiagnostics.js";

/** Files per Oxlint invocation, so command lines stay within OS argv limits. */
const filesPerRun = 100;

const requireFromPackage = createRequire(import.meta.url);
const oxlint = join(dirname(requireFromPackage.resolve("oxlint/package.json")), "bin/oxlint");

const exitCode = async (child: ChildProcess): Promise<number | ArchitectureError> => new Promise((finish) => {
  child.on("error", (error) => {
    finish(new ArchitectureError([`Oxlint could not start: ${error.message}`], { cause: error }));
  });
  child.on("close", (code) => {
    finish(code ?? 1);
  });
});

/** Runs Oxlint once and returns its findings. A non-zero exit without an error finding means Oxlint itself failed. */
const execute = async (root: string, args: readonly string[]): Promise<readonly Finding[] | ArchitectureError> => {
  const child = spawn(process.execPath, [oxlint, ...args], { cwd: root, stdio: ["ignore", "pipe", "inherit"] });
  const [output, code] = await Promise.all([text(child.stdout), exitCode(child)]);
  if (code instanceof ArchitectureError) return code;
  const findings = parseOxlintOutput(root, output);
  if (findings instanceof ArchitectureError) return findings;
  const isToolFailure = code !== 0 && !findings.some(isError);
  if (isToolFailure) return new ArchitectureError([`Oxlint exited with code ${code} without reporting an error`]);
  return findings;
};

const chunks = <Value>(values: readonly Value[], size: number): readonly (readonly Value[])[] => {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
};

const oxlintArguments = (configPath: string, project: Project, files: readonly ClassifiedFile[], fix: boolean): readonly string[] => [
  "--config", configPath, "--disable-nested-config", "--no-ignore", "--type-aware", "--tsconfig", project.configFileName,
  "--report-unused-disable-directives-severity", "error", "--format", "json", ...(fix ? ["--fix"] : []), ...files.map((file) => file.path),
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

/** Runs Oxlint over each project's files with every file's policy. */
const runOxlint = async (
  root: string, configPath: string, files: readonly ClassifiedFile[], projects: readonly Project[], fix: boolean,
): Promise<readonly Finding[] | ArchitectureError> => {
  const invocations = projects.flatMap((project) => {
    const projectFiles = files.filter((file) => project.program.getSourceFile(file.path) !== undefined);
    return chunks(projectFiles, filesPerRun).map((chunk) => oxlintArguments(configPath, project, chunk, fix));
  });
  return runInTurn(root, invocations, []);
};

/**
 * Lints the files through a generated config in a private directory inside the root, where Oxlint's
 * relative globs resolve. The directory is created after inventory and always removed.
 */
export const lint = async (
  root: string, files: readonly ClassifiedFile[], imports: readonly ImportIssue[], projects: readonly Project[], fix: boolean,
): Promise<readonly Finding[] | ArchitectureError> => {
  if (files.length === 0) return [];
  const directory = tryCatch(() => mkdtempSync(join(root, ".architecture-run-")));
  if (directory instanceof ArchitectureError) return directory;
  const configPath = join(directory, "oxlint.json");
  const outcome = await tryCatchAsync(async () => {
    writeFileSync(configPath, JSON.stringify(compileOxlintConfig(files, imports)));
    return runOxlint(root, configPath, files, projects, fix);
  });
  const cleanup = tryCatch(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return afterCleanup(outcome, cleanup);
};
