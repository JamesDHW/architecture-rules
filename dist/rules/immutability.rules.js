import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
export const preferConstRule = defineNativeOxlintRule({
    id: "prefer-const",
    title: "Keep values immutable",
    description: `
Do not reassign bindings. Callers can understand an immutable transformation
without tracking changes over time.
  `.trim(),
    rule: "prefer-const",
    configuration: "error",
});
export const noVarRule = defineNativeOxlintRule({
    id: "no-var",
    title: "Do not use var",
    description: `
Do not reassign bindings or introduce function-scoped var. Immutable const
bindings make data flow easier to follow.
  `.trim(),
    rule: "no-var",
    configuration: "error",
});
export const noParamReassignRule = defineNativeOxlintRule({
    id: "no-param-reassign",
    title: "Do not mutate inputs",
    description: `
Do not mutate inputs, shared state, or previously observable values. Local
mutation may construct a fresh, unaliased result inside a focused helper when
that is clearer than an immutable accumulator.
  `.trim(),
    rule: "no-param-reassign",
    configuration: ["error", { props: true }],
});
export const noUselessAssignmentRule = defineNativeOxlintRule({
    id: "no-useless-assignment",
    title: "Do not keep a result for later through a detour",
    description: `
Do not use an intermediary variable to keep a result for later when the value
can be used now. Assignments that are overwritten before they are read make
the flow rely on state that a later change can corrupt.

Return or pass the value at the point it is known.
  `.trim(),
    rule: "no-useless-assignment",
    configuration: "error",
});
//# sourceMappingURL=immutability.rules.js.map