import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";
/** Policy validation happens before lint, so a broad disable cannot disable this check. */
export declare const checkSuppressions: (files: readonly ClassifiedFile[], projects: readonly Project[]) => Issue[];
//# sourceMappingURL=suppressions.d.ts.map