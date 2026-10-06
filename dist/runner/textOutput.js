const location = ({ file, line, column }) => {
    return `${file}${line === undefined ? "" : `:${line}`}${column === undefined ? "" : `:${column}`}`;
};
const findingLine = (finding) => {
    switch (finding.source) {
        case "lint":
            return `${location(finding)}: ${finding.severity} ${finding.code ?? finding.ruleId}: ${finding.message}`;
        case "structure":
        case "compiler":
            return `${location(finding)}: ${finding.ruleId}: ${finding.message}`;
    }
};
const guidanceLines = ({ ruleId, instead, docs }) => {
    return [`  ${ruleId}: ${instead ?? "see the rule's page"}`, `    ${docs}`];
};
/** Lint findings and the fix guidance go to stdout; structural and compiler findings to stderr. */
export const printText = (findings, guidance) => {
    for (const finding of findings) {
        const stream = finding.source === "lint" ? process.stdout : process.stderr;
        stream.write(`${findingLine(finding)}\n`);
    }
    if (guidance.length === 0)
        return;
    process.stdout.write(`\nHow to fix:\n${guidance.flatMap(guidanceLines).join("\n")}\n`);
};
/** One JSON document with every finding and the guidance for the rules that reported them. */
export const printJson = (findings, guidance) => {
    process.stdout.write(`${JSON.stringify({ findings, rules: guidance }, null, 2)}\n`);
};
//# sourceMappingURL=textOutput.js.map