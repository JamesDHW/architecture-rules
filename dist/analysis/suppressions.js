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
const fileSuppressionIssues = (file, projects) => {
    const source = projects.map((project) => project.program.getSourceFile(file.path)).find(isPresent);
    if (source === undefined)
        return [];
    const comments = new Map(descendants(source).flatMap((node) => nodeComments(source, node)));
    return [...comments]
        .filter((span) => isUnreasonedDirective(commentText(source, span)))
        .map(([start]) => ({
        ruleId: "reasoned-suppressions",
        file: file.relative,
        line: lineOf(source.text, start),
        message: "Only named-rule disable-line/disable-next-line comments with a '-- reason' are permitted; inline rule reconfiguration and broad disables are not.",
    }));
};
/** Policy validation happens before lint, so a broad disable cannot disable this check. */
export const checkSuppressions = (files, projects) => {
    return files.flatMap((file) => fileSuppressionIssues(file, projects));
};
//# sourceMappingURL=suppressions.js.map