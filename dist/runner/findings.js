export const structuralFinding = (issue) => ({
    source: "structure",
    severity: "error",
    ruleId: issue.ruleId,
    file: issue.file,
    ...(issue.line === undefined ? {} : { line: issue.line }),
    message: issue.message,
});
export const isError = (finding) => finding.severity === "error";
//# sourceMappingURL=findings.js.map