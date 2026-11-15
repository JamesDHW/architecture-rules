import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { rules } from "../rules/index.js";
/** The editor's diagnostic severities. */
const errorSeverity = 1;
const warningSeverity = 2;
const docsDirectory = new URL("../../docs/rules/", import.meta.url);
const ruleIds = new Set(rules.map((rule) => rule.id));
/** The rule's documentation page; compiler errors and configuration errors have none. */
const documentation = (ruleId) => {
    if (!ruleIds.has(ruleId))
        return {};
    return { codeDescription: { href: new URL(`${ruleId}.md`, docsDirectory).href } };
};
/** A finding exactly as the CLI reports it: same rule id, same message, same severity, at the same position. */
const toDiagnostic = (finding) => {
    const line = Math.max(0, (finding.line ?? 1) - 1);
    const character = Math.max(0, (finding.column ?? 1) - 1);
    return {
        range: { start: { line, character }, end: { line, character } },
        severity: finding.severity === "error" ? errorSeverity : warningSeverity,
        code: finding.ruleId,
        ...documentation(finding.ruleId),
        source: "architecture",
        message: finding.message,
    };
};
/**
 * Groups findings by file. Files that had diagnostics before and have none now get an empty list, so the editor
 * clears them.
 */
export const fileDiagnostics = (root, findings, previous) => {
    const byFile = Map.groupBy(findings, (finding) => pathToFileURL(join(root, finding.file)).href);
    const cleared = [...previous].filter((uri) => !byFile.has(uri)).map((uri) => ({ uri, diagnostics: [] }));
    return [...[...byFile].map(([uri, group]) => ({ uri, diagnostics: group.map(toDiagnostic) })), ...cleared];
};
//# sourceMappingURL=diagnostics.js.map