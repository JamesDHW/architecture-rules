<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not keep a result for later through a detour

`no-useless-assignment` · Oxlint rule `eslint/no-useless-assignment` · error by default

Do not use an intermediary variable to keep a result for later when the value can be used now. Assignments that are overwritten before they are read make the flow rely on state that a later change can corrupt.

Return or pass the value at the point it is known.

## What to write instead

Use or return the value where it is computed instead of storing it for later.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/no-useless-assignment -- <the concrete reason this line needs it>
```
