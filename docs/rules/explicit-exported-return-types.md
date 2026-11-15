<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Type exported functions at their boundaries

`explicit-exported-return-types` · Lint rule, built on `typescript/explicit-module-boundary-types` · error by default, with options `[{"allowTypedFunctionExpressions":true}]`

Add an explicit return type to every exported non-component function. Allow TypeScript to infer return types for private helpers and inline callbacks.

Explicit boundary types make public contracts visible without burdening small local functions.

## What to write instead

Add an explicit return type to the exported function.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/explicit-module-boundary-types -- <the concrete reason this line needs it>
```
