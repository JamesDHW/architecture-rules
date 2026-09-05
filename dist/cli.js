#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./cli/parseArgs.js";
import { buildTsconfig } from "./generateTsconfig.js";
const HELP = `Usage: architecture-check [--fix] [dir]

Run the architecture-rules Oxlint profile and TypeScript compiler flags
against a project. Defaults to the current directory.
`;
const require = createRequire(import.meta.url);
const resolveBin = (pkg, binFromPackageRoot) => {
    const packageJsonPath = require.resolve(`${pkg}/package.json`);
    return join(dirname(packageJsonPath), binFromPackageRoot);
};
const run = (bin, args, cwd) => {
    return new Promise((resolveExit) => {
        const child = spawn(process.execPath, [bin, ...args], {
            cwd,
            stdio: "inherit",
        });
        child.on("close", (code) => {
            resolveExit(code ?? 1);
        });
    });
};
const toTscFlags = (compilerOptions) => {
    return Object.entries(compilerOptions).flatMap(([key, value]) => {
        if (value === true) {
            return [`--${key}`];
        }
        if (value === false) {
            return [`--${key}`, "false"];
        }
        return [`--${key}`, String(value)];
    });
};
const findTsconfig = (target) => {
    const tsconfigPath = join(target, "tsconfig.json");
    if (!existsSync(tsconfigPath)) {
        return undefined;
    }
    return tsconfigPath;
};
const main = async () => {
    const parsed = parseArgs(process.argv.slice(2));
    if (parsed.kind === "help") {
        process.stdout.write(HELP);
        return 0;
    }
    if (parsed.kind === "error") {
        process.stderr.write(`${parsed.message}\n\n${HELP}`);
        return 1;
    }
    const target = resolve(parsed.target);
    if (!existsSync(target)) {
        process.stderr.write(`Path not found: ${target}\n`);
        return 1;
    }
    const configPath = fileURLToPath(new URL("./oxlint.config.js", import.meta.url));
    const oxlintArgs = [
        "--config",
        configPath,
        "--type-aware",
        ...(parsed.fix ? ["--fix"] : []),
        ".",
    ];
    const oxlintCode = await run(resolveBin("oxlint", "bin/oxlint"), oxlintArgs, target);
    const tsconfigPath = findTsconfig(target);
    if (tsconfigPath === undefined) {
        process.stderr.write("No tsconfig.json found; skipped TypeScript compiler checks.\n");
        return oxlintCode;
    }
    const { compilerOptions } = buildTsconfig();
    const tscCode = await run(resolveBin("typescript", "bin/tsc"), ["--noEmit", "-p", tsconfigPath, ...toTscFlags(compilerOptions)], target);
    if (oxlintCode !== 0) {
        return oxlintCode;
    }
    return tscCode;
};
process.exit(await main());
//# sourceMappingURL=cli.js.map