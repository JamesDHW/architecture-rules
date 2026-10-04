#!/usr/bin/env node
import { existsSync, realpathSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "./cli/parseArgs.js";
import { isArchitecture } from "./core/defineArchitecture.js";
import { checkArchitecture } from "./architecture/runner.js";
const HELP = `Usage: architecture-check [--config path] [--fix] [project-dir]
       architecture-check explain <file> [--config path]

Requires architecture.config.ts (or architecture.config.mts) exporting defineArchitecture(...).
Checks the configured TypeScript programs, rooted at the configuration's directory.
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
    const defaultConfig = ["architecture.config.ts", "architecture.config.mts"].map(name => resolve(args.target, name)).find(path => existsSync(path));
    const configPath = resolve(args.config ?? defaultConfig ?? resolve(args.target, "architecture.config.ts"));
    if (!existsSync(configPath))
        throw new Error(`Required architecture configuration not found: ${configPath}`);
    const root = dirname(realpathSync(configPath));
    const configUrl = pathToFileURL(configPath).href;
    // A .ts config in a package without "type": "module" (e.g. a CommonJS Next app) is still ESM; skip Node's reparse warning.
    registerHooks({ load: (url, context, nextLoad) => nextLoad(url, url === configUrl && configPath.endsWith(".ts") ? { ...context, format: "module-typescript" } : context) });
    // oxlint-disable-next-line architecture/allowed-imports -- Load the user-selected trusted architecture definition.
    const loaded = await import(configUrl);
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