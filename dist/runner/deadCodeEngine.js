import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { text } from "node:stream/consumers";
import { ArchitectureError } from "../errors/architectureError.js";
import { parseReports } from "./deadCodeReports.js";
const requireFromPackage = createRequire(import.meta.url);
/** The engine's command; its package exports no package.json, so it is found from its main module in dist/. */
const engine = () => join(dirname(dirname(requireFromPackage.resolve("knip"))), "bin/knip.js");
const exitCode = async (child) => new Promise((finish) => {
    child.on("error", (error) => {
        finish(new ArchitectureError([`The dead-code analysis could not start: ${error.message}`], { cause: error }));
    });
    child.on("close", (code) => {
        finish(code ?? 1);
    });
});
/** Runs the engine once with the given configuration; production runs see production layers only. */
export const run = async (root, configPath, production) => {
    const args = ["--config", configPath, "--reporter", "json", "--no-progress", "--no-config-hints", "--no-exit-code", ...(production ? ["--production", "--strict"] : [])];
    const child = spawn(process.execPath, [engine(), ...args], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const [output, errors, code] = await Promise.all([text(child.stdout), text(child.stderr), exitCode(child)]);
    if (code instanceof ArchitectureError)
        return code;
    if (code !== 0)
        return new ArchitectureError([`The dead-code analysis exited with code ${code}: ${errors.trim().slice(0, 500)}`]);
    return parseReports(output);
};
//# sourceMappingURL=deadCodeEngine.js.map