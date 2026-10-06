import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import type { RunArgs } from "./parseArgs.js";
/** --config when given, otherwise the first conventional config in the target directory. */
export declare const configPathFor: (args: RunArgs) => string;
/** Loads and validates the default export of architecture.config.ts. */
export declare const loadArchitecture: (configPath: string) => Promise<Architecture | ArchitectureError>;
//# sourceMappingURL=loadArchitecture.d.ts.map