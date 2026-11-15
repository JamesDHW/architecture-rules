<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not mutate inputs

`no-param-reassign` · Lint rule, built on `eslint/no-param-reassign` · error by default, with options `[{"props":true}]`

Do not mutate inputs, shared state, or previously observable values. Local mutation may construct a fresh, unaliased result inside a focused helper when that is clearer than an immutable accumulator.

## What to write instead

Return a new value instead of reassigning or changing a parameter.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/no-param-reassign -- <the concrete reason this line needs it>
```
