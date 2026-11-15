<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use var

`no-var` · Lint rule, built on `eslint/no-var` · error by default

Do not reassign bindings or introduce function-scoped var. Immutable const bindings make data flow easier to follow.

## What to write instead

Declare the binding with const and compute new values instead of reassigning.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-var -- <the concrete reason this line needs it>
```
