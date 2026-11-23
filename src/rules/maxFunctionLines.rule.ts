import type { Rule } from "eslint";

import { isPresent, isRecord } from "../core/guards.js";
import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
import { countLines } from "./lineCounting.js";
import { FUNCTION_ERROR_OPTIONS, FUNCTION_WARN_OPTIONS, type MaxFunctionLinesOptions } from "./maxFunctionLines.constants.js";
import { withPlaceholders } from "./messagePlaceholders.js";

export type { MaxFunctionLinesOptions } from "./maxFunctionLines.constants.js";

const DESCRIPTION = `
Warn when a function is longer than 40 lines and report an error above 80,
not counting blank and comment-only lines. Extract named steps: a function
either coordinates steps or carries out one of them.

File limits do not bound functions: one factory that returns an object of
methods, or one component with every render state inline, can fill a whole
file under the file limit. Nested functions count towards the function that
contains them, so such a factory is measured whole. Immediately invoked
functions are not counted on their own.

Test suites are the usual exception: a describe() callback holds many short
cases, so a tests layer turns these rules off with that reason.
`.trim();

const optionsOf = (value: unknown): MaxFunctionLinesOptions => {
  if (!isRecord(value)) return FUNCTION_WARN_OPTIONS;
  return {
    max: typeof value.max === "number" ? value.max : FUNCTION_WARN_OPTIONS.max,
    skipBlankLines: typeof value.skipBlankLines === "boolean" ? value.skipBlankLines : FUNCTION_WARN_OPTIONS.skipBlankLines,
    skipComments: typeof value.skipComments === "boolean" ? value.skipComments : FUNCTION_WARN_OPTIONS.skipComments,
  };
};

/** A method's length runs from its key, as the error rule measures it. */
const measuredNode = (node: Rule.Node): Rule.Node => {
  const { parent } = node;
  if (parent === null) return node;
  const isMethod = parent.type === "MethodDefinition" || (parent.type === "Property" && (parent.method || parent.kind !== "init"));
  return isMethod ? parent : node;
};

const isImmediatelyInvoked = (node: Rule.Node): boolean => {
  const { parent } = node;
  return parent?.type === "CallExpression" && parent.callee === node;
};

const warnImplementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [{
      type: "object",
      properties: { max: { type: "integer", minimum: 0 }, skipBlankLines: { type: "boolean" }, skipComments: { type: "boolean" } },
      additionalProperties: false,
    }],
    messages: {
      tooManyLines: "Function has {{actual}} lines; warning starts above {{max}}. Extract named steps. See rule max-function-lines-warn.",
    },
  },
  create(context) {
    const options = optionsOf(context.options[0]);
    const check = (node: Rule.Node): void => {
      if (isImmediatelyInvoked(node)) return;
      const { loc } = measuredNode(node);
      if (!isPresent(loc)) return;
      const actual = countLines(context.sourceCode, { ...options, range: { start: loc.start.line, end: loc.end.line } });
      if (actual <= options.max) return;
      context.report(withPlaceholders({ node, messageId: "tooManyLines" }, { actual: String(actual), max: String(options.max) }));
    };
    return { FunctionDeclaration: check, FunctionExpression: check, ArrowFunctionExpression: check };
  },
};

const INSTEAD = "Extract named steps into their own functions, so this one either coordinates them or carries out one.";

export const maxFunctionLinesWarnRule = defineRule({
  id: "max-function-lines-warn",
  options: defineRuleOptions<[Partial<MaxFunctionLinesOptions>?]>(warnImplementation.meta?.schema ?? []),
  title: "Warn when a function is longer than 40 lines",
  description: DESCRIPTION,
  instead: INSTEAD,
  enforcement: { type: "custom-oxlint", configuration: ["warn", FUNCTION_WARN_OPTIONS], implementation: warnImplementation },
});

export const maxFunctionLinesRule = defineNativeOxlintRule({
  id: "max-function-lines",
  title: "Limit functions to 80 lines",
  description: DESCRIPTION,
  instead: INSTEAD,
  rule: "max-lines-per-function",
  configuration: ["error", FUNCTION_ERROR_OPTIONS],
});
