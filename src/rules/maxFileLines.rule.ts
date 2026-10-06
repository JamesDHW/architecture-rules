import type { AST, Rule } from "eslint";

import { isRecord, isPresent } from "../core/guards.js";
import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
import { ERROR_OPTIONS, WARN_OPTIONS, type MaxFileLinesOptions } from "./maxFileLines.constants.js";
import { withPlaceholders } from "./messagePlaceholders.js";

export type { MaxFileLinesOptions } from "./maxFileLines.constants.js";

const DESCRIPTION = `
Warn when a source file exceeds 150 lines and report an error when it exceeds
200 lines. Split the file by cohesive responsibility rather than moving
arbitrary ranges of code.

A bounded file can be understood without navigating a large collection of
unrelated concepts. The warning leaves room to choose a meaningful extraction
before size becomes a hard failure.
`.trim();

const getMaxFileLinesOptions = (value: unknown, defaults: MaxFileLinesOptions): MaxFileLinesOptions => {
  if (!isRecord(value)) return defaults;
  return {
    max: typeof value.max === "number" ? value.max : defaults.max,
    skipBlankLines: typeof value.skipBlankLines === "boolean" ? value.skipBlankLines : defaults.skipBlankLines,
    skipComments: typeof value.skipComments === "boolean" ? value.skipComments : defaults.skipComments,
  };
};

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

const countFileLines = (sourceCode: Rule.RuleContext["sourceCode"], options: MaxFileLinesOptions): number => {
  const lines = dropTrailingEmptyLine(sourceCode.lines).map((text, index) => ({ lineNumber: index + 1, text }));
  const withoutBlanks = options.skipBlankLines ? lines.filter((line) => !isBlank(line.text)) : lines;
  if (!options.skipComments) return withoutBlanks.length;
  const commentOnlyLineNumbers = getCommentOnlyLineNumbers(sourceCode);
  return withoutBlanks.filter((line) => !commentOnlyLineNumbers.has(line.lineNumber)).length;
};

const warnImplementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "integer", minimum: 0 },
          skipBlankLines: { type: "boolean" },
          skipComments: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyLines:
        "File has {{actual}} lines; warning starts at {{max}}. Split by cohesive responsibility. See rule max-file-lines-warn.",
    },
  },
  create(context) {
    return {
      Program(node) {
        const options = getMaxFileLinesOptions(context.options[0], WARN_OPTIONS);
        const actual = countFileLines(context.sourceCode, options);
        if (actual <= options.max) return;
        context.report(withPlaceholders({ node, messageId: "tooManyLines" }, { actual: String(actual), max: String(options.max) }));
      },
    };
  },
};

export const maxFileLinesWarnRule = defineRule({
  id: "max-file-lines-warn",
  options: defineRuleOptions<[Partial<MaxFileLinesOptions>?]>(warnImplementation.meta?.schema ?? []),
  title: "Warn when a source file exceeds 150 lines",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: ["warn", WARN_OPTIONS],
    implementation: warnImplementation,
  },
});

export const maxFileLinesRule = defineNativeOxlintRule({
  id: "max-file-lines",
  title: "Limit source files to 200 lines",
  description: DESCRIPTION,
  rule: "max-lines",
  configuration: ["error", ERROR_OPTIONS],
});
