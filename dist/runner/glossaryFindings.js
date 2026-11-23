import { checkGlossaries } from "../analysis/glossary/check.js";
const finding = (issue, rule) => {
    const severity = rule?.severity ?? "error";
    if (severity === "off")
        return [];
    return [{
            source: "glossary", severity: severity === "warn" ? "warning" : "error", ruleId: issue.ruleId, file: issue.file, message: issue.message,
            ...(issue.line === undefined ? {} : { line: issue.line }), ...(issue.column === undefined ? {} : { column: issue.column }),
        }];
};
export const glossaryFindings = ({ architecture, opened, files, checked, config }) => {
    const result = checkGlossaries({ architecture, files, projects: opened.projects, config, checked: new Set(checked.map((file) => file.relative)) });
    const byPath = new Map(files.map((file) => [file.relative, file]));
    const projectWide = (issue) => finding(issue, architecture.defaults.rules[issue.ruleId]);
    return {
        names: result.names.flatMap((issue) => finding(issue, byPath.get(issue.file)?.policy.rules[issue.ruleId])),
        configuration: result.configuration.flatMap(projectWide),
    };
};
//# sourceMappingURL=glossaryFindings.js.map