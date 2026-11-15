import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import type { Finding } from "./findings.js";
/**
 * Finds unused files, exports and dependencies from the layers' entries, through generated configurations in a
 * private directory inside the root.
 */
export declare const deadCode: (root: string, architecture: Architecture, files: readonly ClassifiedFile[], configFile: string) => Promise<readonly Finding[] | ArchitectureError>;
//# sourceMappingURL=deadCode.d.ts.map