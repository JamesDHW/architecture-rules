import type { ImportAnalysis } from "../imports.js";
import { type ProgramIssue, type ProgramScope } from "./programFile.js";
/** Tiny production files that only one file beside them imports. */
export declare const fileSubstance: (scope: ProgramScope, imports: ImportAnalysis) => readonly ProgramIssue[];
//# sourceMappingURL=fileSubstance.d.ts.map