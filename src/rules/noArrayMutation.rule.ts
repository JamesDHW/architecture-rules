import path from "node:path";
import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not change arrays in place with push, pop, shift, unshift, splice, sort,
reverse, fill or copyWithin. Build the value you need instead: map, filter and
flatMap for transformations, Object.fromEntries for lookups, Array.fromAsync for
one-at-a-time asynchronous work, toSorted, toReversed and toSpliced for
reordering, and an iterator (values()) to consume items one by one.

Good: const failures = (await Array.fromAsync(checks, runCheck)).filter(isFailure);
Bad:  const failures = []; for (const check of checks) { failures.push(await runCheck(check)); }

*.state.ts modules, which hold long-lived state, are exempt. Where in-place
change is measurably faster and that matters, use a reasoned suppression that
names the measurement. The check is by method name, so a non-array method with
the same name (a canvas context's fill) needs a suppression too.
`.trim();

const MUTATING_METHODS = new Set(["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin"]);
const REPLACEMENTS: Readonly<Record<string, string>> = {
  push: "map, filter, flatMap, a spread or Array.fromAsync",
  pop: "at(-1) and slice(0, -1)",
  shift: "an iterator (values()) or slice(1)",
  unshift: "a spread",
  splice: "toSpliced or filter",
  sort: "toSorted",
  reverse: "toReversed",
  fill: "Array.from({ length }, () => value)",
  copyWithin: "a new array built with slice",
};

type MemberCallee = { readonly type: string; readonly computed?: boolean; readonly property: { readonly type: string; readonly name?: string } };

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: {
      arrayMutation: "Do not change an array in place with {{method}}. Use {{replacement}}. See rule no-array-mutation.",
    },
  },
  create(context) {
    const filename = path.basename(context.filename.replaceAll("\\", "/"));
    if (/\.state\.[cm]?tsx?$/.test(filename)) return {};

    return {
      CallExpression(node) {
        const callee = node.callee as unknown as MemberCallee;
        if (callee.type !== "MemberExpression" || callee.computed === true) return;
        const method = callee.property.type === "Identifier" ? callee.property.name : undefined;
        if (method === undefined || !MUTATING_METHODS.has(method)) return;
        context.report({ node, messageId: "arrayMutation", data: { method, replacement: REPLACEMENTS[method] ?? "a new array" } });
      },
    };
  },
};

export const noArrayMutationRule = defineRule({
  id: "no-array-mutation",
  title: "Build new arrays instead of changing them in place",
  description: DESCRIPTION,
  enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
