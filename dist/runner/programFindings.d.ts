import type { ImportAnalysis } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { ProgramScope } from "../analysis/program/programFile.js";
import type { Finding } from "./findings.js";
/** What the program stage reads: every file for the folder and import-graph checks, and the selected ones for the per-file type checks. */
export type ProgramStage = ProgramScope & {
    readonly selected: readonly ClassifiedFile[];
    readonly imports: ImportAnalysis;
};
/** The program checks: type-aware checks over the selected files, folder and import-graph checks over every file. */
export declare const programFindings: ({ selected, imports, ...scope }: ProgramStage) => readonly Finding[];
//# sourceMappingURL=programFindings.d.ts.map