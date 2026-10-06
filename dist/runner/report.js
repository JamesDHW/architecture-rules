export const printIssues = (issues) => {
    for (const issue of issues) {
        process.stderr.write(`${issue.file}${issue.line === undefined ? "" : `:${issue.line}`}: ${issue.ruleId}: ${issue.message}\n`);
    }
};
//# sourceMappingURL=report.js.map