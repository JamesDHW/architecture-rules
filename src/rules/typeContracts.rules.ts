import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";

export const explicitExportedReturnTypesRule = defineNativeOxlintRule({
  id: "explicit-exported-return-types",
  title: "Type exported functions at their boundaries",
  description: `
Add an explicit return type to every exported non-component function. Allow
TypeScript to infer return types for private helpers and inline callbacks.

Explicit boundary types make public contracts visible without burdening small
local functions.
  `.trim(),
  rule: "typescript/explicit-module-boundary-types",
  configuration: ["error", { allowTypedFunctionExpressions: true }],
});

export const typeAliasesRule = defineNativeOxlintRule({
  id: "type-aliases",
  title: "Use type aliases for object shapes",
  description: `
Use type aliases for object shapes as well as unions, functions, and composed
types. Use an interface only at a boundary where a third-party API requires
declaration or module augmentation.

One type-definition syntax removes an arbitrary choice and composes
consistently with unions.
  `.trim(),
  rule: "typescript/consistent-type-definitions",
  configuration: ["error", "type"],
});

export const switchExhaustivenessRule = defineNativeOxlintRule({
  id: "switch-exhaustiveness",
  title: "Handle discriminated unions exhaustively",
  description: `
Complete dispatches over a discriminated union must prove at compile time
that all variants are handled. A targeted narrowing if that intentionally
handles only one variant remains allowed; it is not a complete dispatch.

For a closed-domain default, use return request satisfies never or return a
helper call whose parameter is never. Do not use a generic error fallback
that accepts newly added variants. Open string/number domains may have a
meaningful fallback; validate untrusted values before closed-domain dispatch.

Good: default: return request satisfies never;
Bad: default: return new UnsupportedRequestError();

A handler for part of a union takes the narrowed type, so its signature states
what it handles and a new variant in that part still fails to compile:

Good: type AdminAction = Extract<AppAction, { readonly type: "adminPanel" | "adminForm" }>;
      const reduceAdmin = (state: AppState, action: AdminAction) => { switch (action.type) { ... } };
Bad: const reduceAdmin = (state: AppState, action: AppAction) => { switch (action.type) { ...; default: return null; } };

A union you do not own, such as NodeJS.Platform, is an open domain: use a
single targeted if, or a Partial<Record<...>> lookup with a ?? fallback.

Native enforcement verifies missing union cases even when a default exists.
It does not require an explicit never default or prove a helper's parameter
contract; those parts remain review obligations checked with TypeScript.

Exhaustiveness turns additions to a state model into useful compiler errors at
every affected decision point.
  `.trim(),
  rule: "typescript/switch-exhaustiveness-check",
  configuration: [
    "error",
    {
      considerDefaultExhaustiveForUnions: false,
      allowDefaultCaseForExhaustiveSwitch: true,
    },
  ],
});
