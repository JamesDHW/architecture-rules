import { ArchitectureError } from "../errors/architectureError.js";
import type { CheckResult } from "../runner/checkResult.js";
/** A file to rename, and why another one could not be. */
export type Rename = {
    readonly from: string;
    readonly to: string;
};
type Skipped = {
    readonly file: string;
    readonly reason: string;
};
export type RenamePlan = {
    readonly renames: readonly Rename[];
    readonly skipped: readonly Skipped[];
};
/** Plans a rename for every file with a file-naming finding that a case change fixes. */
export declare const planRenames: (result: CheckResult, inScope: (file: string) => boolean) => RenamePlan;
/** Renames the files and updates every import of them. Returns how many import specifiers changed. */
export declare const applyRenames: (root: string, result: CheckResult, renames: readonly Rename[]) => number | ArchitectureError;
export {};
//# sourceMappingURL=renameFix.d.ts.map