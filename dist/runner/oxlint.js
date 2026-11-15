import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { text } from "node:stream/consumers";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup, allOrError } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { compileOxlintConfig } from "./compileOxlintConfig.js";
import { isError } from "./findings.js";
import { parseOxlintOutput } from "./oxlintDiagnostics.js";
/**
 * Characters of file paths per lint run. Command lines have OS limits (about 32k characters on Windows),
 * and every run loads the TypeScript project again, so runs are as large as the limit allows.
 */
const pathCharactersPerRun = process.platform === "win32" ? 24_000 : 200_000;
const requireFromPackage = createRequire(import.meta.url);
const oxlint = join(dirname(requireFromPackage.resolve("oxlint/package.json")), "bin/oxlint");
const exitCode = async (child) => new Promise((finish) => {
    child.on("error", (error) => {
        finish(new ArchitectureError([`The lint engine could not start: ${error.message}`], { cause: error }));
    });
    child.on("close", (code) => {
        finish(code ?? 1);
    });
});
const failureDetail = (errors) => {
    const detail = errors.trim();
    return detail.length === 0 ? "" : `: ${detail.slice(0, 500)}`;
};
/** Runs the lint engine once and returns its findings. A non-zero exit without an error finding means the engine itself failed. */
const execute = async (root, args) => {
    const child = spawn(process.execPath, [oxlint, ...args], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const [output, errors, code] = await Promise.all([text(child.stdout), text(child.stderr), exitCode(child)]);
    if (code instanceof ArchitectureError)
        return code;
    const findings = parseOxlintOutput(root, output);
    if (findings instanceof ArchitectureError)
        return new ArchitectureError([...findings.issues.map((issue) => `${issue}${failureDetail(errors)}`)]);
    const isToolFailure = code !== 0 && !findings.some(isError);
    if (isToolFailure)
        return new ArchitectureError([`The lint engine exited with code ${code} without reporting an error${failureDetail(errors)}`]);
    return findings;
};
const chunks = (values, size) => {
    return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
};
/** Splits files into runs whose paths fit within pathCharactersPerRun, sized by the longest path. */
const batches = (files) => {
    const longest = Math.max(1, ...files.map((file) => file.path.length + 1));
    return chunks(files, Math.max(1, Math.floor(pathCharactersPerRun / longest)));
};
const oxlintArguments = (configPath, project, files, fix) => [
    "--config", configPath, "--disable-nested-config", "--no-ignore", "--type-aware", "--tsconfig", project.configFileName,
    "--format", "json", ...(fix ? ["--fix"] : []), ...files.map((file) => file.path),
];
/** Runs each invocation in turn, so --fix runs never race, and keeps every run's findings. */
const runInTurn = async (root, invocations, done) => {
    const [args, ...rest] = invocations;
    if (args === undefined) {
        const runs = allOrError(done);
        return runs instanceof ArchitectureError ? runs : runs.flat();
    }
    const findings = await execute(root, args);
    return runInTurn(root, rest, [...done, findings]);
};
/** Lints each project's files with every file's policy: one run per project unless its paths exceed the command-line budget. */
const runOxlint = async (root, configPath, files, projects, fix) => {
    const invocations = projects.flatMap((project) => {
        const projectFiles = files.filter((file) => project.program.getSourceFile(file.path) !== undefined);
        return batches(projectFiles).map((batch) => oxlintArguments(configPath, project, batch, fix));
    });
    return runInTurn(root, invocations, []);
};
/**
 * Lints the files through a generated config in a private directory inside the root, where the
 * engine's relative globs resolve. The directory is created after inventory and always removed.
 */
export const lint = async (root, files, imports, projects, fix) => {
    if (files.length === 0)
        return [];
    const directory = tryCatch(() => mkdtempSync(join(root, ".architecture-run-")));
    if (directory instanceof ArchitectureError)
        return directory;
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
//# sourceMappingURL=oxlint.js.map