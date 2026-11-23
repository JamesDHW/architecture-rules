import type { ImportAnalysis } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import { directorySize } from "../analysis/program/directorySize.js";
import { discardedErrors } from "../analysis/program/discardedErrors.js";
import { fileSubstance } from "../analysis/program/fileSubstance.js";
import { literalLists } from "../analysis/program/literalLists.js";
import type { ProgramIssue, ProgramScope } from "../analysis/program/programFile.js";
import type { Finding } from "./findings.js";

const toFinding = (issue: ProgramIssue): Finding => ({
  source: "program",
  severity: issue.severity === "warn" ? "warning" : "error",
  ruleId: issue.ruleId,
  file: issue.file,
  ...(issue.line === undefined ? {} : { line: issue.line }),
  message: issue.message,
});

/** What the program stage reads: every file for the folder and import-graph checks, and the selected ones for the per-file type checks. */
export type ProgramStage = ProgramScope & { readonly selected: readonly ClassifiedFile[]; readonly imports: ImportAnalysis };

/** The program checks: type-aware checks over the selected files, folder and import-graph checks over every file. */
export const programFindings = ({ selected, imports, ...scope }: ProgramStage): readonly Finding[] => {
  const typed = { ...scope, files: selected };
  return [...discardedErrors(typed), ...literalLists(typed), ...directorySize(scope), ...fileSubstance(scope, imports)].map(toFinding);
};
