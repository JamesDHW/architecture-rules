import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
export const namedExportsRule = defineNativeOxlintRule({
    id: "named-exports",
    title: "Prefer named exports",
    description: `
Use named exports wherever the surrounding framework permits them. Use a
default export only when a framework requires one. Configuration files
(*.config.ts, .mts, .cts, .js, .mjs, .cjs) are exempt: build and test tools
load their configuration from the default export.

Named exports keep identifiers consistent between their definitions and
imports, which makes references easier to search, navigate, and refactor.
  `.trim(),
    rule: "import/no-default-export",
    configuration: "error",
});
export const noCycleRule = defineNativeOxlintRule({
    id: "no-cycle",
    title: "Forbid circular dependencies",
    description: `
Keep file and package dependency graphs acyclic. If two modules depend on each
other, extract the shared concept or reverse an effectful dependency through an
injected capability rather than retaining the cycle.

A cycle makes neither module independently understandable and obscures
initialization order.
  `.trim(),
    rule: "import/no-cycle",
    configuration: "error",
});
//# sourceMappingURL=modules.rules.js.map