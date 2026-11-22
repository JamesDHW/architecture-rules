export const structuralFinding = (issue) => ({
    source: "structure",
    severity: "error",
    ruleId: issue.ruleId,
    file: issue.file,
    ...(issue.line === undefined ? {} : { line: issue.line }),
    message: issue.message,
});
export const isError = (finding) => finding.severity === "error";
/** An error that fails the check: every error but recorded debt in a file the change did not touch. */
export const isBlocking = (finding) => isError(finding) && finding.status !== "baselined";
const byPosition = (left, right) => {
    const byFile = left.file.localeCompare(right.file);
    if (byFile !== 0)
        return byFile;
    const byLine = (left.line ?? 0) - (right.line ?? 0);
    if (byLine !== 0)
        return byLine;
    const byColumn = (left.column ?? 0) - (right.column ?? 0);
    if (byColumn !== 0)
        return byColumn;
    const byRule = left.ruleId.localeCompare(right.ruleId);
    return byRule === 0 ? left.message.localeCompare(right.message) : byRule;
};
/** Findings in file, line, column, rule and message order, so every output lists them the same way. */
export const sortFindings = (findings) => findings.toSorted(byPosition);
//# sourceMappingURL=findings.js.map