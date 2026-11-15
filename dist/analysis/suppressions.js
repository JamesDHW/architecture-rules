import { getLeadingCommentRanges, getTrailingCommentRanges, isJsxExpression, SyntaxKind } from "typescript/unstable/ast";
import { isPresent } from "../core/guards.js";
import { descendants } from "./syntaxTree.js";
const lintDirective = /^(?:eslint|oxlint)(?:-|\s)/;
const reasonedLineDirective = /^(?:eslint|oxlint)-disable-(?:next-line|line)\s+[^\s]+(?:\s*,\s*[^\s]+)*\s+--\s+\S/;
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
const isUnreasonedDirective = (text) => lintDirective.test(text) && !reasonedLineDirective.test(text);
const lineOf = (text, offset) => text.slice(0, offset).split("\n").length;
/** Every lint directive comment in the file: the text after // or /*, with its line. */
const directiveComments = (file, projects) => {
    const source = projects.map((project) => project.program.getSourceFile(file.path)).find(isPresent);
    if (source === undefined)
        return [];
    const comments = new Map(descendants(source).flatMap((node) => nodeComments(source, node)));
    return [...comments]
        .map((span) => ({ file: file.relative, line: lineOf(source.text, span[0]), text: commentText(source, span) }))
        .filter((comment) => lintDirective.test(comment.text));
};
const unreasonedIssue = (comment) => ({
    ruleId: "reasoned-suppressions",
    file: comment.file,
    line: comment.line,
    message: "Only named-rule disable-line/disable-next-line comments with a '-- reason' are permitted; inline rule reconfiguration and broad disables are not.",
});
/** Policy validation happens before lint, so a broad disable cannot disable this check. */
export const checkSuppressions = (files, projects) => {
    return files.flatMap((file) => directiveComments(file, projects).filter((comment) => isUnreasonedDirective(comment.text)).map(unreasonedIssue));
};
const reasonedParts = /^(?:eslint|oxlint)-disable-(?:next-line|line)\s+(.+?)\s+--\s+(.+)$/s;
const toSuppression = (comment) => {
    const parts = reasonedParts.exec(comment.text);
    if (parts === null)
        return [];
    const [, ruleList = "", reason = ""] = parts;
    return [{ file: comment.file, line: comment.line, rules: ruleList.split(",").map((rule) => rule.trim()), reason: reason.trim() }];
};
/** Every reasoned suppression in the files, for the report. */
export const listSuppressions = (files, projects) => {
    return files.flatMap((file) => directiveComments(file, projects).flatMap(toSuppression));
};
//# sourceMappingURL=suppressions.js.map