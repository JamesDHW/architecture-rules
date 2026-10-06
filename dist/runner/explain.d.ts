import type { Projects } from "../analysis/projects.js";
import { type Inventory, type Issue } from "../analysis/inventory.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
/** Prints how the architecture treats one file, as JSON; 1 when it is unclassified or the tree has structural issues. */
export declare const explainFile: (root: string, architecture: Architecture, opened: Projects, tree: Inventory, structural: readonly Issue[], file: string) => number | ArchitectureError;
//# sourceMappingURL=explain.d.ts.map