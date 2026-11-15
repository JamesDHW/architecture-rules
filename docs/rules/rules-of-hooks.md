<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Follow the Rules of Hooks

`rules-of-hooks` · Oxlint rule `react/rules-of-hooks` · error by default

Hooks must run in the same order on every render. Conditional or nested hook calls create state that cannot be understood or reproduced reliably.

## What to write instead

Call hooks unconditionally, at the top level of a component or another hook.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line react/rules-of-hooks -- <the concrete reason this line needs it>
```
