<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Remove unreachable statements after terminal exits

`no-unreachable-statements` · Lint rule, built on `eslint/no-unreachable` · error by default

```
Good: publishProject(); return; Bad: return; publishProject(); Unreachable work misrepresents the operation and often exposes an incorrectly placed exit.
```

## What to write instead

Move or delete the code after the return, throw or break.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-unreachable-statements -- <the concrete reason this line needs it>
```
