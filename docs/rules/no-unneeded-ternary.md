<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use a ternary as a boolean detour

`no-unneeded-ternary` · Lint rule, built on `eslint/no-unneeded-ternary` · error by default

Do not use an intermediary expression to keep a boolean for later. A ternary that only produces true or false from a condition is a detour.

Stopping the flow instead of accumulating conversions prevents unwanted behaviour during a change.

## What to write instead

Use the condition itself instead of condition ? true : false.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-unneeded-ternary -- <the concrete reason this line needs it>
```
