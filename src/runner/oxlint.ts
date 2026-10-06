import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { Project } from "typescript/unstable/sync";

import type { ImportIssue } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { compileOxlintConfig } from "./compileOxlintConfig.js";

/** Files per Oxlint invocation, so command lines stay within OS argv limits. */
const filesPerRun = 100;

const requireFromPackage = createRequire(import.meta.url);
const oxlint = join(dirname(requireFromPackage.resolve("oxlint/package.json")), "bin/oxlint");

const execute = async (args: readonly string[], cwd: string): Promise<number> => new Promise((finish) => {
  const child = spawn(process.execPath, [oxlint, ...args], { cwd, stdio: "inherit" });
  child.on("error", (error) => {
    process.stderr.write(`${error.message}\n`);
    finish(1);
  });
  child.on("close", (code) => {
    finish(code ?? 1);
  });
});

const chunks = <Value>(values: readonly Value[], size: number): readonly (readonly Value[])[] => {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
};

const oxlintArguments = (configPath: string, project: Project, files: readonly ClassifiedFile[], fix: boolean): readonly string[] => [
  "--config", configPath, "--disable-nested-config", "--no-ignore", "--type-aware", "--tsconfig", project.configFileName,
  "--report-unused-disable-directives-severity", "error", ...(fix ? ["--fix"] : []), ...files.map((file) => file.path),
];

/** Runs each invocation in turn, so --fix runs never race; resolves to 1 when any run failed. */
const runInTurn = async (invocations: readonly (readonly string[])[], root: string, failed: boolean): Promise<number> => {
  const [args, ...rest] = invocations;
  if (args === undefined) return failed ? 1 : 0;
  const code = await execute(args, root);
  return runInTurn(rest, root, failed || code !== 0);
};

/** Runs Oxlint over each project's files with every file's policy. */
const runOxlint = async (root: string, configPath: string, files: readonly ClassifiedFile[], projects: readonly Project[], fix: boolean): Promise<number> => {
  const invocations = projects.flatMap((project) => {
    const projectFiles = files.filter((file) => project.program.getSourceFile(file.path) !== undefined);
    return chunks(projectFiles, filesPerRun).map((chunk) => oxlintArguments(configPath, project, chunk, fix));
  });
  return runInTurn(invocations, root, false);
};

/**
 * Lints the files through a generated config in a private directory inside the root, where Oxlint's
 * relative globs resolve. The directory is created after inventory and always removed.
 */
export const lint = async (
  root: string, files: readonly ClassifiedFile[], imports: readonly ImportIssue[], projects: readonly Project[], fix: boolean,
): Promise<number | ArchitectureError> => {
  if (files.length === 0) return 0;
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
