import { ArchitectureError } from "../errors/architectureError.js";
import { type Report } from "./deadCodeReports.js";
/** Runs the engine once with the given configuration; production runs see production layers only. */
export declare const run: (root: string, configPath: string, production: boolean) => Promise<readonly Report[] | ArchitectureError>;
//# sourceMappingURL=deadCodeEngine.d.ts.map