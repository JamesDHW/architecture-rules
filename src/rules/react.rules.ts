import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";

export const explicitJsxPropsRule = defineNativeOxlintRule({
  id: "explicit-jsx-props",
  title: "Pass JSX props explicitly",
  description: `
List application-component props explicitly at the call site rather than
spreading an object. Prop spreading is allowed only inside a low-level
pass-through primitive whose explicit purpose is forwarding native attributes.

Explicit props expose a component's inputs where it is used and prevent
unrelated object fields from silently becoming part of the call.
  `.trim(),
  rule: "react/jsx-props-no-spreading",
  configuration: ["error", { html: "ignore", custom: "enforce" }],
});

export const moduleScopeComponentsRule = defineNativeOxlintRule({
  id: "module-scope-components",
  title: "Declare components and hooks at module scope",
  description: `
Do not define a React component or hook inside another function. Declare it at
module scope and pass every required value through explicit props or hook
inputs.

Nested component declarations recreate component identity during rendering.
  `.trim(),
  rule: "react/no-unstable-nested-components",
  configuration: "error",
});

export const rulesOfHooksRule = defineNativeOxlintRule({
  id: "rules-of-hooks",
  title: "Follow the Rules of Hooks",
  description: `
Hooks must run in the same order on every render. Conditional or nested hook
calls create state that cannot be understood or reproduced reliably.
  `.trim(),
  rule: "react/rules-of-hooks",
  configuration: "error",
});

export const exhaustiveDepsRule = defineNativeOxlintRule({
  id: "exhaustive-deps",
  title: "Declare exhaustive effect dependencies",
  description: `
Effect and memoization dependency lists that omit reactive values hide stale
closures and missed updates. List every value the callback closes over.
  `.trim(),
  rule: "react/exhaustive-deps",
  configuration: "error",
});

export const jsxKeyRule = defineNativeOxlintRule({
  id: "jsx-key",
  title: "Use stable list keys",
  description: `
List items need a stable key so React can reconcile identity across renders.
Missing or index keys cause subtle state bugs when the list changes.
  `.trim(),
  rule: "react/jsx-key",
  configuration: "error",
});
