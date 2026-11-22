import { checkGlossaries } from "../analysis/glossaryCheck.js";
const finding = (issue, rule) => {
    const severity = rule?.severity ?? "error";
    if (severity === "off")
        return [];
    return [{
            source: "glossary", severity: severity === "warn" ? "warning" : "error", ruleId: issue.ruleId, file: issue.file, message: issue.message,
            ...(issue.line === undefined ? {} : { line: issue.line }), ...(issue.column === undefined ? {} : { column: issue.column }),
        }];
};
/**
 * Glossary findings: about names in the checked files, at the severity their layer gives each rule, and about the
 * glossaries in the configuration, at the project-wide severity.
 */
export const glossaryFindings = (architecture, opened, files, checked, config) => {
    const result = checkGlossaries(architecture, files, opened.projects, config, new Set(checked.map((file) => file.relative)));
    const byPath = new Map(files.map((file) => [file.relative, file]));
    const projectWide = (issue) => finding(issue, architecture.defaults.rules[issue.ruleId]);
    return {
        names: result.names.flatMap((issue) => finding(issue, byPath.get(issue.file)?.policy.rules[issue.ruleId])),
        configuration: result.configuration.flatMap(projectWide),
    };
};
//# sourceMappingURL=glossaryFindings.js.map