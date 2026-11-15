<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Reveal logic operators

`prefer-logical-over-ternary` · Lint rule, built on `unicorn/prefer-logical-operator-over-ternary` · error by default

Do not hide simple || or && operations inside a ternary that repeats one of its branches. Prefer the logical operator so the combination is visible.

A ternary of the form a ? a : b or a ? b : a is a disguised || or &&.

## What to write instead

Use a || b instead of a ? a : b.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line unicorn/prefer-logical-operator-over-ternary -- <the concrete reason this line needs it>
```
