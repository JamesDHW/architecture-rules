#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { dirname } from "node:path";
import { ArchitectureError } from "./errors/architectureError.js";
import { tryCatchAsync } from "./errors/tryCatch.js";
import { checkArchitecture } from "./runner/runner.js";
import { configPathFor, loadArchitecture } from "./cli/loadArchitecture.js";
import { parseArgs } from "./cli/parseArgs.js";
const help = `Usage: architecture-check [--config path] [--fix] [project-dir]
       architecture-check explain <file> [--config path]

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
const check = async (args) => {
    const configPath = configPathFor(args);
    const architecture = await loadArchitecture(configPath);
    if (architecture instanceof ArchitectureError)
        return architecture;
    const explain = args.explain === undefined ? {} : { explain: args.explain };
    return checkArchitecture(dirname(realpathSync(configPath)), architecture, { fix: args.fix, ...explain });
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
        case "run":
            return run(args);
    }
};
process.exitCode = await main();
//# sourceMappingURL=cli.js.map