/** Lint findings can be excepted on a line; structural and compiler findings cannot. */
const isExceptableFinding = (finding) => finding.source === "lint";
const covers = (exception, ruleId) => (finding) => {
    return finding.file === exception.file && finding.line === exception.target && finding.ruleId === ruleId && isExceptableFinding(finding);
};
const isExcepted = (exceptions) => (finding) => {
    return exceptions.some((exception) => exception.rules.some((ruleId) => covers(exception, ruleId)(finding)));
};
const unusedFinding = (exception, ruleId) => ({
    source: "structure",
    severity: "error",
    ruleId: "reasoned-suppressions",
    file: exception.file,
    line: exception.line,
    message: `Unused exception: line ${exception.target} has no ${ruleId} finding. Remove ${ruleId} from the exception.`,
});
/** Drops the findings line exceptions cover, and reports every exception rule that covered nothing. */
export const applyExceptions = (findings, exceptions) => {
    const unused = exceptions.flatMap((exception) => exception.rules
        .filter((ruleId) => !findings.some(covers(exception, ruleId)))
        .map((ruleId) => unusedFinding(exception, ruleId)));
    return [...findings.filter((finding) => !isExcepted(exceptions)(finding)), ...unused];
};
/** For --fix: the rules each file excepts somewhere, which must not be auto-fixed in that file. */
export const exceptedRulesByFile = (exceptions) => {
    const byFile = Map.groupBy(exceptions, (exception) => exception.file);
    return new Map([...byFile].map(([file, entries]) => [file, new Set(entries.flatMap((entry) => entry.rules))]));
};
//# sourceMappingURL=exceptions.js.map