import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";

export const guardClausesRule = defineNativeOxlintRule({
  id: "guard-clauses",
  title: "Use guard clauses for terminal cases",
  description: `
Legacy independently configurable check, disabled by default because no-else
already rejects every else branch. Avoid else after a return. Exit the conditional
flow as soon as you can. Most else blocks after a terminal statement are
superfluous.

A chain of if/else/else if keeps extra conditions in mind, especially when
nested. Reserving conditional blocks for special cases emphasises the
nominal path and makes it easier to evolve.
  `.trim(),
  rule: "no-else-return",
  configuration: ["off", { allowElseIf: false }],
});

export const nullishDefaultsRule = defineNativeOxlintRule({
  id: "nullish-defaults",
  title: "Use nullish coalescing for missing-value defaults",
  description: `
Use ?? when supplying a fallback for missing data. Do not use || for value
defaulting; reserve it for boolean logic.

Nullish coalescing states that only null or undefined is missing and preserves
intentional values such as an empty string, zero, and false.

Good: const displayName = suppliedName ?? "Anonymous";
Bad: const displayName = isNullish(suppliedName) ? "Anonymous" : suppliedName;

Explicit branches remain appropriate when null and undefined mean different
things. Empty-string fallback is a named policy, not implicit truthiness.
Native enforcement may not recognize project-specific guard calls; review
those redundant helper-based ternaries against the same policy.
  `.trim(),
  rule: "typescript/prefer-nullish-coalescing",
  configuration: "error",
});

export const eqeqeqRule = defineNativeOxlintRule({
  id: "eqeqeq",
  title: "Use explicit equality",
  description: `
Only boolean-typed expressions may be tested directly. Compare values
explicitly according to the intended condition rather than relying on
JavaScript coercion.
  `.trim(),
  rule: "eqeqeq",
  configuration: "error",
});

export const noBooleanCastRule = defineNativeOxlintRule({
  id: "no-boolean-cast",
  title: "Do not cast into a boolean",
  description: `
Casting to boolean, implicitly or explicitly, hides the intended condition.
Truthiness is not consistent across languages and runtimes, which leads to
unwanted results.

Compare the value according to the intended condition. Do not coerce with
!! or Boolean().
  `.trim(),
  rule: "no-implicit-coercion",
  configuration: [
    "error",
    { boolean: true, number: false, string: false },
  ],
});

export const noUnneededTernaryRule = defineNativeOxlintRule({
  id: "no-unneeded-ternary",
  title: "Do not use a ternary as a boolean detour",
  description: `
Do not use an intermediary expression to keep a boolean for later. A ternary
that only produces true or false from a condition is a detour.

Stopping the flow instead of accumulating conversions prevents unwanted
behaviour during a change.
  `.trim(),
  rule: "no-unneeded-ternary",
  configuration: "error",
});

export const preferLogicalOverTernaryRule = defineNativeOxlintRule({
  id: "prefer-logical-over-ternary",
  title: "Reveal logic operators",
  description: `
Do not hide simple || or && operations inside a ternary that repeats one of
its branches. Prefer the logical operator so the combination is visible.

A ternary of the form a ? a : b or a ? b : a is a disguised || or &&.
  `.trim(),
  rule: "unicorn/prefer-logical-operator-over-ternary",
  configuration: "error",
});
