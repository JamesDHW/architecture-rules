import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";

const DESCRIPTION = `
Warn when a source file exceeds 150 lines and report an error when it exceeds
200 lines. Split the file by cohesive responsibility rather than moving
arbitrary ranges of code.

A bounded file can be understood without navigating a large collection of
unrelated concepts. The warning leaves room to choose a meaningful extraction
before size becomes a hard failure.
`.trim();

type LineRange = {
  readonly start: { readonly line: number; readonly column: number };
  readonly end: { readonly line: number; readonly column: number };
};

type MaxFileLinesOptions = {
  readonly max: number;
  readonly skipBlankLines: boolean;
  readonly skipComments: boolean;
};

const WARN_OPTIONS = {
  max: 150,
  skipBlankLines: true,
  skipComments: true,
} as const satisfies MaxFileLinesOptions;

const ERROR_OPTIONS = {
  max: 200,
  skipBlankLines: true,
  skipComments: true,
} as const satisfies MaxFileLinesOptions;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const getMaxFileLinesOptions = (
  value: unknown,
  defaults: MaxFileLinesOptions,
): MaxFileLinesOptions => {
  if (!isPlainObject(value)) {
    return defaults;
  }

  return {
    max: typeof value.max === "number" ? value.max : defaults.max,
    skipBlankLines:
      typeof value.skipBlankLines === "boolean"
        ? value.skipBlankLines
        : defaults.skipBlankLines,
    skipComments:
      typeof value.skipComments === "boolean"
        ? value.skipComments
        : defaults.skipComments,
  };
};

const dropTrailingEmptyLine = (lines: readonly string[]): readonly string[] => {
  if (lines.length <= 1) {
    return lines;
  }

  if (lines[lines.length - 1] !== "") {
    return lines;
  }

  return lines.slice(0, -1);
};

const addCommentOnlyLines = (
  lineNumbers: Set<number>,
  lines: readonly string[],
  loc: LineRange,
) => {
  const startLine = loc.start.line;
  const endLine = loc.end.line;

  if (startLine === endLine) {
    const line = lines[startLine - 1] ?? "";
    const before = line.slice(0, loc.start.column);
    const after = line.slice(loc.end.column);
    if (before.trim() !== "" || after.trim() !== "") {
      return;
    }

    lineNumbers.add(startLine);
    return;
  }

  const startText = lines[startLine - 1] ?? "";
  if (startText.slice(0, loc.start.column).trim() === "") {
    lineNumbers.add(startLine);
  }

  for (let line = startLine + 1; line < endLine; line += 1) {
    lineNumbers.add(line);
  }

  const endText = lines[endLine - 1] ?? "";
  if (endText.slice(loc.end.column).trim() === "") {
    lineNumbers.add(endLine);
  }
};

const getCommentOnlyLineNumbers = (
  sourceCode: Rule.RuleContext["sourceCode"],
): ReadonlySet<number> => {
  const lineNumbers = new Set<number>();

  for (const comment of sourceCode.getAllComments()) {
    if (comment.loc === null || comment.loc === undefined) {
      continue;
    }

    addCommentOnlyLines(lineNumbers, sourceCode.lines, comment.loc);
  }

  return lineNumbers;
};

const countFileLines = (
  sourceCode: Rule.RuleContext["sourceCode"],
  options: MaxFileLinesOptions,
): number => {
  const lines = dropTrailingEmptyLine(sourceCode.lines).map((text, index) => ({
    lineNumber: index + 1,
    text,
  }));

  const withoutBlanks = options.skipBlankLines
    ? lines.filter((line) => line.text.trim() !== "")
    : lines;

  if (!options.skipComments) {
    return withoutBlanks.length;
  }

  const commentOnlyLineNumbers = getCommentOnlyLineNumbers(sourceCode);
  return withoutBlanks.filter((line) => {
    return !commentOnlyLineNumbers.has(line.lineNumber);
  }).length;
};

const warnImplementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "integer",
            minimum: 0,
          },
          skipBlankLines: {
            type: "boolean",
          },
          skipComments: {
            type: "boolean",
          },
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
        if (actual <= options.max) {
          return;
        }

        context.report({
          node,
          messageId: "tooManyLines",
          data: {
            actual: String(actual),
            max: String(options.max),
          },
        });
      },
    };
  },
};

export const maxFileLinesWarnRule = defineRule({
  id: "max-file-lines-warn",
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
