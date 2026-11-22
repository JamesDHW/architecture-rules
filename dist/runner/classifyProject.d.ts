import { type Inventory } from "../analysis/inventory.js";
import type { Architecture } from "../config/types.js";
import type { ArchitectureError } from "../errors/architectureError.js";
/** Every source file of the programs and the layer it belongs to, plus the files that match no layer or several. */
export declare const classifyProject: (rootPath: string, architecture: Architecture) => Promise<Inventory | ArchitectureError>;
//# sourceMappingURL=classifyProject.d.ts.map