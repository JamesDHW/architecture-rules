import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import type { CheckResult } from "../runner/checkResult.js";
import { type InspectOptions } from "../runner/runner.js";
/** A loaded configuration and the root it governs. */
export type LoadedProject = {
    readonly root: string;
    readonly configPath: string;
    readonly architecture: Architecture;
};
export type InspectedProject = LoadedProject & {
    readonly result: CheckResult;
};
export declare const loadProject: (target: string, config: string | undefined) => Promise<LoadedProject | ArchitectureError>;
/** --file paths as the real absolute paths the checker compares, resolved from the working directory. */
export declare const selectedFiles: (paths: readonly string[] | undefined) => {
    readonly files?: readonly string[];
} | ArchitectureError;
/** Loads the configuration and runs the whole check, without printing anything. */
export declare const inspectProject: (target: string, config: string | undefined, options?: Omit<InspectOptions, "configFile">) => Promise<InspectedProject | ArchitectureError>;
//# sourceMappingURL=inspectProject.d.ts.map