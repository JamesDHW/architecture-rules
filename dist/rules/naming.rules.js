import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
export const genericNameDenylistRule = defineNativeOxlintRule({
    id: "generic-name-denylist",
    title: "Use complete, domain-specific names",
    description: `
Name values by their domain role using complete words. Do not use generic
placeholders such as data, item, obj, arr, or tmp.

Specific names carry context into every use and remove the need to inspect a
declaration to infer what a generic placeholder represents.
  `.trim(),
    rule: "id-denylist",
    configuration: ["error", "data", "item", "obj", "arr", "tmp"],
});
export const noShadowRule = defineNativeOxlintRule({
    id: "no-shadow",
    title: "Do not hide a name from an enclosing scope",
    description: `
Do not declare a name that hides one from an enclosing scope, including an
import. A destructured prop named like an imported style or helper silently
replaces it inside the component, and both are often strings, so TypeScript
cannot tell.
  `.trim(),
    rule: "no-shadow",
    configuration: "error",
});
//# sourceMappingURL=naming.rules.js.map