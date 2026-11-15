import { isError } from "./findings.js";
/** Findings outside every layer, such as package.json or a tsconfig, are counted under this name. */
const projectScope = "project";
const plural = (count, singular, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;
const duration = (milliseconds) => (milliseconds < 1000 ? `${milliseconds}ms` : `${(milliseconds / 1000).toFixed(1)}s`);
const header = ({ projects, files, architecture }) => {
    const layers = Object.keys(architecture.layers).length;
    return `architecture-check · ${plural(projects, "project")} · ${plural(files.length, "file")} · ${plural(layers, "layer")}`;
};
const position = ({ line, column }) => {
    if (line === undefined)
        return "";
    return column === undefined ? String(line) : `${line}:${column}`;
};
const widths = (findings) => ({
    position: Math.max(0, ...findings.map((finding) => position(finding).length)),
    rule: Math.max(0, ...findings.map((finding) => finding.ruleId.length)),
});
const findingLine = (finding, { position: positionWidth, rule }) => {
    const severity = finding.severity.padEnd("warning".length);
    return `  ${position(finding).padEnd(positionWidth)}  ${severity}  ${finding.ruleId.padEnd(rule)}  ${finding.message}`;
};
const findingBlocks = (findings) => {
    const columns = widths(findings);
    const byFile = Map.groupBy(findings, (finding) => finding.file);
    return [...byFile].map(([file, group]) => [file, ...group.map((finding) => findingLine(finding, columns))].join("\n"));
};
/** "name count · name count", most frequent first. */
const tally = (names) => {
    const counts = [...Map.groupBy(names, (name) => name)].map(([name, group]) => [name, group.length]);
    const byCountThenName = ([leftName, left], [rightName, right]) => {
        return right === left ? leftName.localeCompare(rightName) : right - left;
    };
    return counts.toSorted(byCountThenName)
        .map(([name, count]) => `${name} ${count}`)
        .join(" · ");
};
const statusMark = (status) => {
    switch (status) {
        case "passed":
            return "✓";
        case "failed":
            return "✗";
        case "skipped":
            return "skipped";
    }
};
const stageLabel = ({ name, status }) => `${name.replace("-", " ")} ${statusMark(status)}`;
const headline = (findings) => {
    const errors = findings.filter(isError).length;
    const warnings = findings.length - errors;
    const files = new Set(findings.map((finding) => finding.file)).size;
    if (findings.length === 0)
        return "✓ No findings";
    const counts = [...(errors > 0 ? [plural(errors, "error")] : []), ...(warnings > 0 ? [plural(warnings, "warning")] : [])].join(" and ");
    return `${errors > 0 ? "✗" : "!"} ${counts} in ${plural(files, "file")}`;
};
const summary = (result) => {
    const layerOf = new Map([...result.files.map((file) => [file.relative, file.layer]), [result.configFile, "configuration"]]);
    const { findings } = result;
    const stages = `${result.stages.map(stageLabel).join(" · ")} · ${duration(result.durationMs)}`;
    const breakdown = findings.length === 0 ? [] : [
        `  by rule:   ${tally(findings.map((finding) => finding.ruleId))}`,
        `  by layer:  ${tally(findings.map((finding) => layerOf.get(finding.file) ?? projectScope))}`,
    ];
    return [headline(findings), ...breakdown, `  stages:    ${stages}`].join("\n");
};
const guidanceLines = ({ ruleId, instead, docs }) => {
    return [`  ${ruleId}: ${instead ?? "see the rule's page"}`, `    ${docs}`];
};
const guidanceBlock = (guidance) => {
    return guidance.length === 0 ? [] : [`How to fix:\n${guidance.flatMap(guidanceLines).join("\n")}`];
};
/** Findings grouped by file, a summary by rule, layer and stage, then how to fix each rule that fired. */
export const renderText = (result, guidance) => {
    const blocks = [header(result), ...findingBlocks(result.findings), summary(result), ...guidanceBlock(guidance)];
    return `${blocks.join("\n\n")}\n`;
};
/** One JSON document: every finding, the guidance for the rules that reported them, and the summary. */
export const renderJson = (result, guidance) => {
    const errors = result.findings.filter(isError).length;
    const summaryData = {
        projects: result.projects,
        files: result.files.length,
        layers: Object.keys(result.architecture.layers).length,
        errors,
        warnings: result.findings.length - errors,
        stages: result.stages,
        durationMs: result.durationMs,
    };
    return `${JSON.stringify({ findings: result.findings, rules: guidance, summary: summaryData }, null, 2)}\n`;
};
//# sourceMappingURL=textOutput.js.map