<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Remove unreachable statements after terminal exits

`no-unreachable-statements` · Lint rule, built on `eslint/no-unreachable` · error by default

```
Good: publishProject(); return; Bad: return; publishProject(); Unreachable work misrepresents the operation and often exposes an incorrectly placed exit.
```

## What to write instead

Move or delete the code after the return, throw or break.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/no-unreachable -- <the concrete reason this line needs it>
```
