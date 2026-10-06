import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";

export const reduceSimpleFoldsRule = defineNativeOxlintRule({
  id: "reduce-simple-folds",
  title: "Use reduce only for simple folds",
  description: `
Use reduce only when the result is genuinely a single simple fold, such as a
sum, minimum, or maximum. Use dedicated operations such as map, filter, or a
descriptively named helper for transformation, selection, grouping, indexing,
and multi-purpose accumulation.

General accumulators force readers to simulate each iteration and track the
accumulator's shape.
  `.trim(),
  rule: "unicorn/no-array-reduce",
  configuration: ["error", { allowSimpleOperations: true }],
});

export const noForEachRule = defineNativeOxlintRule({
  id: "no-for-each",
  title: "Do not use forEach",
  description: `
Use map, filter, or another dedicated transformation for direct value
transformations. Use for...of when intentionally sequencing effects. Do not
use forEach, including with asynchronous callbacks.

The iteration form should reveal whether code directly transforms data,
constructs a result, or performs effects. forEach discards callback results
and misleadingly accepts async callbacks without awaiting them.
  `.trim(),
  rule: "unicorn/no-array-for-each",
  configuration: "error",
});

export const preferAtRule = defineNativeOxlintRule({
  id: "prefer-at",
  title: "Check every indexed collection access",
  description: `
Treat array, tuple, and record lookup results as possibly undefined unless the
type system proves that the key exists. Prefer .at() for index access so
absence is part of the result.

Runtime collections do not guarantee that an index or key exists.
  `.trim(),
  rule: "unicorn/prefer-at",
  configuration: "error",
});
