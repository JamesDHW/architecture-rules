import { getLeadingCommentRanges, getTrailingCommentRanges, SyntaxKind, isJsxExpression, type Node } from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";

/** Policy validation happens before lint, so a broad disable cannot disable this check. */
export const checkSuppressions = (files: readonly ClassifiedFile[], projects: readonly Project[]): Issue[] => {
  const issues: Issue[] = [];
  for (const file of files) {
    const source = projects.map((project) => project.program.getSourceFile(file.path)).find((value) => value !== undefined);
    if (source === undefined) continue;
    const comments = new Map<number, number>();
    const visit = (node: Node): void => {
      const inJsxChildren = node.parent?.kind === SyntaxKind.JsxElement || node.parent?.kind === SyntaxKind.JsxFragment;
      const leading = node.kind === SyntaxKind.JsxText ? [] : getLeadingCommentRanges(source.text, node.pos) ?? [];
      const trailing = inJsxChildren ? [] : getTrailingCommentRanges(source.text, node.end) ?? [];
      const jsxComments = isJsxExpression(node) ? [...(getLeadingCommentRanges(source.text, node.getStart(source) + 1) ?? []), ...(getTrailingCommentRanges(source.text, node.getStart(source) + 1) ?? [])] : [];
      for (const comment of [...leading, ...trailing, ...jsxComments]) comments.set(comment.pos, comment.end);
      node.forEachChild((child) => { visit(child); });
    };
    visit(source);
    for (const [start, end] of comments) {
      const text = source.text.slice(start, end).replace(/^\/[/\*]\s*/, "").replace(/\*\/$/, "").trim();
      if (!/^(?:eslint|oxlint)(?:-|\s)/.test(text)) continue;
      if (!/^(?:eslint|oxlint)-disable-(?:next-line|line)\s+[^\s]+(?:\s*,\s*[^\s]+)*\s+--\s+\S/.test(text)) {
        issues.push({ ruleId: "reasoned-suppressions", file: file.relative, line: source.text.slice(0, start).split("\n").length, message: "Only named-rule disable-line/disable-next-line comments with a '-- reason' are permitted; inline rule reconfiguration and broad disables are not." });
      }
    }
  }
  return issues;
};
