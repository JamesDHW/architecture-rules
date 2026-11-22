import { ArchitectureError } from "../errors/architectureError.js";
/** git's merge driver: merges the three versions and writes the result over the current one, as git expects. */
export declare const mergeBaselineFiles: (ancestorPath: string, currentPath: string, otherPath: string) => number | ArchitectureError;
//# sourceMappingURL=mergeBaselines.d.ts.map