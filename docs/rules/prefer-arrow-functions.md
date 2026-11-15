<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Prefer arrow functions

`prefer-arrow-functions` · Lint rule, built on `eslint/func-style` · error by default, with options `["expression"]`

Use arrow functions for named operations, React components, callbacks, and closures. Use other function forms only where the language or an API requires them.

One default function syntax reduces incidental variation, while arrow functions also make lexical this behavior consistent and explicit.

## What to write instead

Declare the function as a const arrow function.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/func-style -- <the concrete reason this line needs it>
```
