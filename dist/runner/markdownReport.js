import { rules } from "../rules/index.js";
const cell = (text) => text.replaceAll("|", "\\|").replaceAll("\n", " ");
const table = (header, rows, empty) => {
    if (rows.length === 0)
        return empty;
    const line = (cells) => `| ${cells.map(cell).join(" | ")} |`;
    return [line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n");
};
const countBy = (values, key) => {
    return new Map(Object.entries(Object.groupBy(values, key)).map(([name, group]) => [name, group?.length ?? 0]));
};
const findingRows = (findings) => {
    const errors = countBy(findings.filter((finding) => finding.severity === "error"), (finding) => finding.ruleId);
    const warnings = countBy(findings.filter((finding) => finding.severity === "warning"), (finding) => finding.ruleId);
    const ruleIds = [...new Set(findings.map((finding) => finding.ruleId))].toSorted();
    return ruleIds.map((ruleId) => [ruleId, String(errors.get(ruleId) ?? 0), String(warnings.get(ruleId) ?? 0)]);
};
const setting = ({ severity, options }) => (options.length === 0 ? severity : `${severity} ${JSON.stringify(options)}`);
/** Rules a scope declares itself, rather than inherits. */
const declaredOverrides = (scope, effective) => {
    return Object.entries(effective)
        .filter(([, rule]) => rule.origin === scope)
        .map(([ruleId, rule]) => [scope, ruleId, setting(rule), rule.reason ?? ""]);
};
const overrideRows = (architecture) => [
    ...declaredOverrides("architecture", architecture.defaults.rules),
    ...Object.entries(architecture.layers).flatMap(([name, layer]) => declaredOverrides(`layers.${name}`, layer.policy.rules)),
];
const layerRows = (architecture, files) => {
    const counts = countBy(files, (file) => file.layer);
    return Object.entries(architecture.layers).map(([name, layer]) => {
        const generated = layer.policy.generated === undefined ? "" : `generated: ${layer.policy.generated.reason}`;
        return [name, String(counts.get(name) ?? 0), [layer.description, generated].filter((part) => part.length > 0).join(" ")];
    });
};
const advisoryLines = () => {
    return rules.filter((rule) => rule.enforcement.type === "advisory").map((rule) => `- \`${rule.id}\`: ${rule.title}`);
};
/** A Markdown report of the check: findings by rule, every exception, configuration overrides and layers. */
export const renderReport = ({ architecture, files, findings, exceptions }) => {
    const errorCount = findings.filter((finding) => finding.severity === "error").length;
    const summary = `${files.length} source files in ${Object.keys(architecture.layers).length} layers. `
        + `${errorCount} errors, ${findings.length - errorCount} warnings, ${exceptions.length} exceptions.`;
    const exceptionRows = exceptions.map(({ file, line, rules: ruleNames, reason }) => [file, String(line), ruleNames.join(", "), reason]);
    return [
        "# Architecture report",
        summary,
        "## Findings by rule",
        table(["Rule", "Errors", "Warnings"], findingRows(findings), "None."),
        "## Exceptions",
        table(["File", "Line", "Rules", "Reason"], exceptionRows, "None."),
        "## Configuration overrides",
        table(["Where", "Rule", "Setting", "Reason"], overrideRows(architecture), "None."),
        "## Layers",
        table(["Layer", "Files", "Description"], layerRows(architecture, files), "None."),
        "## Not checked automatically",
        advisoryLines().join("\n"),
    ].join("\n\n").concat("\n");
};
//# sourceMappingURL=markdownReport.js.map