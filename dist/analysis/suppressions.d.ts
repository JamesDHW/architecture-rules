import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";
/** Policy validation happens before lint, so a broad disable cannot disable this check. */
export declare const checkSuppressions: (files: readonly ClassifiedFile[], projects: readonly Project[]) => readonly Issue[];
/** A reasoned line suppression: where it is, which rules it turns off and why. */
export type Suppression = {
    readonly file: string;
    readonly line: number;
    readonly rules: readonly string[];
    readonly reason: string;
};
/** Every reasoned suppression in the files, for the report. */
export declare const listSuppressions: (files: readonly ClassifiedFile[], projects: readonly Project[]) => readonly Suppression[];
//# sourceMappingURL=suppressions.d.ts.map