<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Prefer arrow functions for callbacks

`prefer-arrow-callback` · Oxlint rule `eslint/prefer-arrow-callback` · error by default

Use arrow functions for callbacks and closures. One default function syntax reduces incidental variation, while arrow functions also make lexical this behavior consistent and explicit.

## What to write instead

Pass an arrow function as the callback.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/prefer-arrow-callback -- <the concrete reason this line needs it>
```
