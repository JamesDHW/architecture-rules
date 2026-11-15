export const structuralFinding = (issue) => ({
    source: "structure",
    severity: "error",
    ruleId: issue.ruleId,
    file: issue.file,
    ...(issue.line === undefined ? {} : { line: issue.line }),
    message: issue.message,
});
export const isError = (finding) => finding.severity === "error";
const byPosition = (left, right) => {
    const byFile = left.file.localeCompare(right.file);
    if (byFile !== 0)
        return byFile;
    const byLine = (left.line ?? 0) - (right.line ?? 0);
    if (byLine !== 0)
        return byLine;
    return (left.column ?? 0) - (right.column ?? 0);
};
/** Findings in file, line and column order, so every output lists them the same way. */
export const sortFindings = (findings) => findings.toSorted(byPosition);
//# sourceMappingURL=findings.js.map