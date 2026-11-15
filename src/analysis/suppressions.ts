import { getLeadingCommentRanges, getTrailingCommentRanges, isJsxExpression, SyntaxKind, type Node, type SourceFile } from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";

import { isPresent } from "../core/guards.js";
import type { ClassifiedFile, Issue } from "./inventory.js";
import { descendants } from "./syntaxTree.js";

type CommentSpan = readonly [start: number, end: number];

const lintDirective = /^(?:eslint|oxlint)(?:-|\s)/;
const reasonedLineDirective = /^(?:eslint|oxlint)-disable-(?:next-line|line)\s+[^\s]+(?:\s*,\s*[^\s]+)*\s+--\s+\S/;

const spans = (ranges: readonly { readonly pos: number; readonly end: number }[] | undefined): readonly CommentSpan[] => {
  return (ranges ?? []).map((range) => [range.pos, range.end] as const);
};

const isJsxChild = (node: Node): boolean => {
  // The root has no parent at runtime, whatever the declarations say.
  if (node.kind === SyntaxKind.SourceFile) return false;
  const parentKind = node.parent.kind;
  return parentKind === SyntaxKind.JsxElement || parentKind === SyntaxKind.JsxFragment;
};

const jsxExpressionComments = (source: SourceFile, node: Node): readonly CommentSpan[] => {
  if (!isJsxExpression(node)) return [];
  const start = node.getStart(source) + 1;
  return [...spans(getLeadingCommentRanges(source.text, start)), ...spans(getTrailingCommentRanges(source.text, start))];
};

const nodeComments = (source: SourceFile, node: Node): readonly CommentSpan[] => [
  ...(node.kind === SyntaxKind.JsxText ? [] : spans(getLeadingCommentRanges(source.text, node.pos))),
  ...(isJsxChild(node) ? [] : spans(getTrailingCommentRanges(source.text, node.end))),
  ...jsxExpressionComments(source, node),
];

const commentText = (source: SourceFile, [start, end]: CommentSpan): string => {
  return source.text.slice(start, end).replace(/^\/[/*]\s*/, "").replace(/\*\/$/, "").trim();
};

const isUnreasonedDirective = (text: string): boolean => lintDirective.test(text) && !reasonedLineDirective.test(text);

const lineOf = (text: string, offset: number): number => text.slice(0, offset).split("\n").length;

type DirectiveComment = { readonly file: string; readonly line: number; readonly text: string };

/** Every lint directive comment in the file: the text after // or /*, with its line. */
const directiveComments = (file: ClassifiedFile, projects: readonly Project[]): readonly DirectiveComment[] => {
  const source = projects.map((project) => project.program.getSourceFile(file.path)).find(isPresent);
  if (source === undefined) return [];
  const comments = new Map(descendants(source).flatMap((node) => nodeComments(source, node)));
  return [...comments]
    .map((span) => ({ file: file.relative, line: lineOf(source.text, span[0]), text: commentText(source, span) }))
    .filter((comment) => lintDirective.test(comment.text));
};

const unreasonedIssue = (comment: DirectiveComment): Issue => ({
  ruleId: "reasoned-suppressions",
  file: comment.file,
  line: comment.line,
  message: "Only named-rule disable-line/disable-next-line comments with a '-- reason' are permitted; inline rule reconfiguration and broad disables are not.",
});

/** Policy validation happens before lint, so a broad disable cannot disable this check. */
export const checkSuppressions = (files: readonly ClassifiedFile[], projects: readonly Project[]): readonly Issue[] => {
  return files.flatMap((file) => directiveComments(file, projects).filter((comment) => isUnreasonedDirective(comment.text)).map(unreasonedIssue));
};

/** A reasoned line suppression: where it is, which rules it turns off and why. */
export type Suppression = { readonly file: string; readonly line: number; readonly rules: readonly string[]; readonly reason: string };

const reasonedParts = /^(?:eslint|oxlint)-disable-(?:next-line|line)\s+(.+?)\s+--\s+(.+)$/s;

const toSuppression = (comment: DirectiveComment): readonly Suppression[] => {
  const parts = reasonedParts.exec(comment.text);
  if (parts === null) return [];
  const [, ruleList = "", reason = ""] = parts;
  return [{ file: comment.file, line: comment.line, rules: ruleList.split(",").map((rule) => rule.trim()), reason: reason.trim() }];
};

/** Every reasoned suppression in the files, for the report. */
export const listSuppressions = (files: readonly ClassifiedFile[], projects: readonly Project[]): readonly Suppression[] => {
  return files.flatMap((file) => directiveComments(file, projects).flatMap(toSuppression));
};
