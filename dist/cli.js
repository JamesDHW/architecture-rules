#!/usr/bin/env node
import { existsSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "./cli/parseArgs.js";
import { isArchitecture } from "./core/defineArchitecture.js";
import { checkArchitecture } from "./architecture/runner.js";
const HELP = `Usage: architecture-check [--config path] [--fix] [project-dir]
       architecture-check explain <file> [--config path]

Requires architecture.config.ts exporting defineArchitecture(...).
Checks the entire project rooted at the configuration's directory.
`;
const main = async () => {
    const args = parseArgs(process.argv.slice(2));
    if (args.kind === "help") {
        process.stdout.write(HELP);
        return 0;
    }
    if (args.kind === "error") {
        process.stderr.write(`${args.message}\n${HELP}`);
        return 1;
    }
    const configPath = resolve(args.config ?? resolve(args.target, "architecture.config.ts"));
    if (!existsSync(configPath))
        throw new Error(`Required architecture configuration not found: ${configPath}`);
    const root = dirname(realpathSync(configPath));
    // oxlint-disable-next-line architecture/allowed-imports -- Load the user-selected trusted architecture definition.
    const loaded = await import(pathToFileURL(configPath).href);
    if (!isArchitecture(loaded.default))
        throw new Error("Configuration must default-export defineArchitecture(...)");
    return checkArchitecture(root, loaded.default, { fix: args.fix, ...(args.explain === undefined ? {} : { explain: args.explain }) });
};
try {
    process.exitCode = await main();
}
catch (error) {
    process.stderr.write(`architecture-config: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
}
//# sourceMappingURL=cli.js.map