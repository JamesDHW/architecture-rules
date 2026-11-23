import { directorySize } from "../analysis/program/directorySize.js";
import { discardedErrors } from "../analysis/program/discardedErrors.js";
import { fileSubstance } from "../analysis/program/fileSubstance.js";
import { literalLists } from "../analysis/program/literalLists.js";
const toFinding = (issue) => ({
    source: "program",
    severity: issue.severity === "warn" ? "warning" : "error",
    ruleId: issue.ruleId,
    file: issue.file,
    ...(issue.line === undefined ? {} : { line: issue.line }),
    message: issue.message,
});
/** The program checks: type-aware checks over the selected files, folder and import-graph checks over every file. */
export const programFindings = ({ selected, imports, ...scope }) => {
    const typed = { ...scope, files: selected };
    return [...discardedErrors(typed), ...literalLists(typed), ...directorySize(scope), ...fileSubstance(scope, imports)].map(toFinding);
};
//# sourceMappingURL=programFindings.js.map