import { getLeadingCommentRanges, getTrailingCommentRanges, isJsxExpression, SyntaxKind } from "typescript/unstable/ast";
import { isPresent } from "../core/guards.js";
import { isExceptable, lintRuleName } from "../rules/lintNames.js";
import { rules } from "../rules/index.js";
import { descendants } from "./syntaxTree.js";
/** The only exception syntax: named architecture rule ids and a reason, for one line. */
const exceptionPattern = /^architecture-disable-(next-line|line)\s+(.+?)\s+--\s+(\S.*)$/s;
const ownDirective = /^architecture-(?:disable|enable)\b/;
/** Disable or configuration comments for the underlying engines. They are never read, so they are rejected. */
const foreignDirective = /^(?:eslint|oxlint)(?:-|\s)/;
const legacyException = /^(?:eslint|oxlint)-disable-(next-line|line)\s+(.+?)\s+--\s+(\S.*)$/s;
const exceptionSyntax = "`// architecture-disable-next-line <rule-id> -- <reason>`";
const spans = (ranges) => {
    return (ranges ?? []).map((range) => [range.pos, range.end]);
};
const isJsxChild = (node) => {
    // The root has no parent at runtime, whatever the declarations say.
    if (node.kind === SyntaxKind.SourceFile)
        return false;
    const parentKind = node.parent.kind;
    return parentKind === SyntaxKind.JsxElement || parentKind === SyntaxKind.JsxFragment;
};
const jsxExpressionComments = (source, node) => {
    if (!isJsxExpression(node))
        return [];
    const start = node.getStart(source) + 1;
    return [...spans(getLeadingCommentRanges(source.text, start)), ...spans(getTrailingCommentRanges(source.text, start))];
};
const nodeComments = (source, node) => [
    ...(node.kind === SyntaxKind.JsxText ? [] : spans(getLeadingCommentRanges(source.text, node.pos))),
    ...(isJsxChild(node) ? [] : spans(getTrailingCommentRanges(source.text, node.end))),
    ...jsxExpressionComments(source, node),
];
const commentText = (source, [start, end]) => {
    return source.text.slice(start, end).replace(/^\/[/*]\s*/, "").replace(/\*\/$/, "").trim();
};
const lineOf = (text, offset) => text.slice(0, offset).split("\n").length;
const isDirective = (text) => ownDirective.test(text) || foreignDirective.test(text);
const sourceOf = (file, projects) => {
    return projects.map((project) => project.program.getSourceFile(file.path)).find(isPresent);
};
/** Every exception or engine directive comment in the file: the text after // or /*, with its lines. */
const directiveComments = (file, projects) => {
    const source = sourceOf(file, projects);
    if (source === undefined)
        return [];
    const comments = new Map(descendants(source).flatMap((node) => nodeComments(source, node)));
    return [...comments]
        .map((span) => ({ file, span, line: lineOf(source.text, span[0]), endLine: lineOf(source.text, span[1]), text: commentText(source, span) }))
        .filter((comment) => isDirective(comment.text));
};
/** The architecture rule a legacy engine rule name refers to, such as architecture/no-let or eslint/id-denylist. */
const rulesByLegacyName = new Map(rules.flatMap((rule) => {
    const name = lintRuleName(rule);
    return name === undefined ? [] : [[name, rule.id]];
}));
const legacyRuleId = (name) => rulesByLegacyName.get(name) ?? rulesByLegacyName.get(`eslint/${name}`);
const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
const ruleList = (list) => list.split(",").map((rule) => rule.trim());
const issue = (comment, message) => ({ ruleId: "reasoned-suppressions", file: comment.file.relative, line: comment.line, message });
const legacyRules = (comment) => {
    const parts = legacyException.exec(comment.text);
    if (parts === null)
        return undefined;
    const ids = ruleList(parts[2] ?? "").map(legacyRuleId);
    return ids.every(isPresent) ? ids : undefined;
};
const foreignIssue = (comment) => {
    const convertible = legacyRules(comment) === undefined ? "" : " architecture-check --fix converts this one.";
    return issue(comment, `Write exceptions as ${exceptionSyntax}; other disable comments are not read.${convertible}`);
};
const ruleIssues = (comment, ruleIds) => ruleIds.flatMap((ruleId) => {
    const rule = rulesById.get(ruleId);
    if (rule === undefined)
        return [issue(comment, `Unknown rule "${ruleId}" in an exception. Use the rule ids from docs/rules.`)];
    if (!isExceptable(rule))
        return [issue(comment, `"${ruleId}" cannot be excepted: structural and compiler checks always apply.`)];
    return [];
});
const readComment = (comment) => {
    if (foreignDirective.test(comment.text))
        return { exceptions: [], issues: [foreignIssue(comment)] };
    const parts = exceptionPattern.exec(comment.text);
    if (parts === null) {
        return { exceptions: [], issues: [issue(comment, `An exception names its rules and gives a reason: ${exceptionSyntax}. File-wide and unexplained exceptions are not allowed.`)] };
    }
    const [, kind = "", list = "", reason = ""] = parts;
    const ruleIds = ruleList(list);
    const problems = ruleIssues(comment, ruleIds);
    if (problems.length > 0)
        return { exceptions: [], issues: problems };
    const target = kind === "next-line" ? comment.endLine + 1 : comment.line;
    return { exceptions: [{ file: comment.file.relative, line: comment.line, target, rules: ruleIds, reason: reason.trim() }], issues: [] };
};
/**
 * Reads every line exception in the files. Malformed exceptions, unknown or structural rules and engine
 * directive comments are structural issues, found before lint so no comment can switch a check off.
 */
export const readExceptions = (files, projects) => {
    const read = files.flatMap((file) => directiveComments(file, projects)).map(readComment);
    return { exceptions: read.flatMap((entry) => entry.exceptions), issues: read.flatMap((entry) => entry.issues) };
};
/** The structural issues readExceptions reports. */
export const checkSuppressions = (files, projects) => readExceptions(files, projects).issues;
const migration = (comment, source) => {
    const parts = legacyException.exec(comment.text);
    const ids = legacyRules(comment);
    const isConvertible = parts !== null && ids !== undefined;
    if (!isConvertible)
        return undefined;
    const [, kind = "", , reason = ""] = parts;
    const raw = source.text.slice(comment.span[0], comment.span[1]);
    const start = comment.span[0] + raw.indexOf(comment.text);
    return { path: comment.file.path, start, end: start + comment.text.length, replacement: `architecture-disable-${kind} ${ids.join(", ")} -- ${reason.trim()}` };
};
/** Edits that rewrite reasoned engine disable comments into exceptions, for --fix. Comments naming unknown rules are left alone. */
export const exceptionMigrations = (files, projects) => {
    return files.flatMap((file) => {
        const source = sourceOf(file, projects);
        if (source === undefined)
            return [];
        return directiveComments(file, projects).map((comment) => migration(comment, source)).filter(isPresent);
    });
};
//# sourceMappingURL=suppressions.js.map