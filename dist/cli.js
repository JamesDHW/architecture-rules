#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ArchitectureError } from "./errors/architectureError.js";
import { allOrError } from "./errors/results.js";
import { tryCatch, tryCatchAsync } from "./errors/tryCatch.js";
import { checkArchitecture } from "./runner/runner.js";
import { describeCommand } from "./cli/describeCommand.js";
import { configPathFor, loadArchitecture } from "./config/loadArchitecture.js";
import { parseArgs } from "./cli/parseArgs.js";
import { startServer } from "./editor/server.js";
const help = `Usage: architecture-check [--config path] [--fix] [--json] [--file path]... [project-dir]
       architecture-check explain <file> [--config path]
       architecture-check describe [--json | --mermaid] [--config path] [project-dir]
       architecture-check report [--config path] [project-dir]
       architecture-check lsp

--file      Lint and report only this file (repeatable); the whole project is still analyzed.
--json      Print every finding, and what to write instead, as one JSON document.
report      Prints a Markdown report: findings by rule, exceptions, configuration overrides and layers.
lsp         Runs the language server editors use: the same findings as the check, on every save.

Requires architecture.config.ts (or architecture.config.mts) exporting defineArchitecture(...).
Checks the configured TypeScript programs, rooted at the configuration's directory.
`;
const printHelp = () => {
    process.stdout.write(help);
    return 0;
};
const printUsageError = (message) => {
    process.stderr.write(`${message}\n${help}`);
    return 1;
};
const printError = (error) => {
    for (const issue of error.issues) {
        process.stderr.write(`architecture-config: ${issue}\n`);
    }
    return 1;
};
/** --file paths as the real absolute paths the checker compares, resolved from the working directory. */
const selectedFiles = (paths) => {
    if (paths === undefined)
        return {};
    const files = allOrError(paths.map((path) => tryCatch(() => realpathSync(resolve(path)))));
    return files instanceof ArchitectureError ? files : { files };
};
const check = async (args) => {
    if (args.describe !== undefined)
        return describeCommand(args, args.describe);
    const configPath = configPathFor(args.target, args.config);
    const architecture = await loadArchitecture(configPath);
    if (architecture instanceof ArchitectureError)
        return architecture;
    const files = selectedFiles(args.files);
    if (files instanceof ArchitectureError)
        return files;
    const explain = args.explain === undefined ? {} : { explain: args.explain };
    const format = args.format === undefined ? {} : { format: args.format };
    return checkArchitecture(dirname(realpathSync(configPath)), architecture, { fix: args.fix, configFile: configPath, ...explain, ...format, ...files });
};
const run = async (args) => {
    const outcome = await tryCatchAsync(async () => check(args));
    return outcome instanceof ArchitectureError ? printError(outcome) : outcome;
};
const main = async () => {
    const args = parseArgs(process.argv.slice(2));
    switch (args.kind) {
        case "help":
            return printHelp();
        case "error":
            return printUsageError(args.message);
        case "lsp":
            return startServer();
        case "run":
            return run(args);
    }
};
process.exitCode = await main();
//# sourceMappingURL=cli.js.map