import type { AST, Rule } from "eslint";

import { isPresent } from "../core/guards.js";

/** Which lines a count leaves out. */
export type LineCountOptions = { readonly skipBlankLines: boolean; readonly skipComments: boolean };

/** A 1-based, inclusive range of lines; the whole file when omitted. */
export type LineRange = { readonly start: number; readonly end: number };

const dropTrailingEmptyLine = (lines: readonly string[]): readonly string[] => {
  const hasTrailingEmptyLine = lines.length > 1 && lines.at(-1) === "";
  return hasTrailingEmptyLine ? lines.slice(0, -1) : lines;
};

const isBlank = (text: string): boolean => text.trim() === "";

/** Lines a comment occupies with nothing but whitespace beside it. */
const commentOnlyLines = (lines: readonly string[], loc: AST.SourceLocation): readonly number[] => {
  const startLine = loc.start.line;
  const endLine = loc.end.line;
  const startText = lines[startLine - 1] ?? "";
  const endText = lines[endLine - 1] ?? "";
  if (startLine === endLine) {
    const standsAlone = isBlank(startText.slice(0, loc.start.column)) && isBlank(startText.slice(loc.end.column));
    return standsAlone ? [startLine] : [];
  }
  const innerLines = Array.from({ length: endLine - startLine - 1 }, (_unused, offset) => startLine + 1 + offset);
  const firstLines = isBlank(startText.slice(0, loc.start.column)) ? [startLine] : [];
  const lastLines = isBlank(endText.slice(loc.end.column)) ? [endLine] : [];
  return [...firstLines, ...innerLines, ...lastLines];
};

const getCommentOnlyLineNumbers = (sourceCode: Rule.RuleContext["sourceCode"]): ReadonlySet<number> => {
  return new Set(sourceCode.getAllComments().flatMap((comment) => isPresent(comment.loc) ? commentOnlyLines(sourceCode.lines, comment.loc) : []));
};

const isWithin = (range: LineRange | undefined) => (line: { readonly lineNumber: number }): boolean => {
  return range === undefined || (line.lineNumber >= range.start && line.lineNumber <= range.end);
};

/** Counts the lines of the file, or of a range of it, without the lines the options skip. */
export const countLines = (sourceCode: Rule.RuleContext["sourceCode"], options: LineCountOptions & { readonly range?: LineRange }): number => {
  const lines = dropTrailingEmptyLine(sourceCode.lines).map((text, index) => ({ lineNumber: index + 1, text })).filter(isWithin(options.range));
  const withoutBlanks = options.skipBlankLines ? lines.filter((line) => !isBlank(line.text)) : lines;
  if (!options.skipComments) return withoutBlanks.length;
  const commentOnlyLineNumbers = getCommentOnlyLineNumbers(sourceCode);
  return withoutBlanks.filter((line) => !commentOnlyLineNumbers.has(line.lineNumber)).length;
};
