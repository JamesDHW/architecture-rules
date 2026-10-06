import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
export const preferArrowFunctionsRule = defineNativeOxlintRule({
    id: "prefer-arrow-functions",
    title: "Prefer arrow functions",
    description: `
Use arrow functions for named operations, React components, callbacks, and
closures. Use other function forms only where the language or an API requires
them.

One default function syntax reduces incidental variation, while arrow functions
also make lexical this behavior consistent and explicit.
  `.trim(),
    rule: "func-style",
    configuration: ["error", "expression"],
});
export const preferArrowCallbackRule = defineNativeOxlintRule({
    id: "prefer-arrow-callback",
    title: "Prefer arrow functions for callbacks",
    description: `
Use arrow functions for callbacks and closures. One default function syntax
reduces incidental variation, while arrow functions also make lexical this
behavior consistent and explicit.
  `.trim(),
    rule: "prefer-arrow-callback",
    configuration: "error",
});
//# sourceMappingURL=functionStyle.rules.js.map