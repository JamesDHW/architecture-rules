import type { Rule } from "eslint";

import { isRecord } from "../core/guards.js";
import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
import { countLines } from "./lineCounting.js";
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
        const actual = countLines(context.sourceCode, options);
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
  instead: "Split the file by responsibility: move one cohesive concept into its own file.",
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
  instead: "Split the file by responsibility: move one cohesive concept into its own file.",
  rule: "max-lines",
  configuration: ["error", ERROR_OPTIONS],
});
