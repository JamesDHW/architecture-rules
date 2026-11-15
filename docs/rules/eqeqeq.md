<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use explicit equality

`eqeqeq` · Lint rule, built on `eslint/eqeqeq` · error by default

Only boolean-typed expressions may be tested directly. Compare values explicitly according to the intended condition rather than relying on JavaScript coercion.

## What to write instead

Use === or !==.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/eqeqeq -- <the concrete reason this line needs it>
```
