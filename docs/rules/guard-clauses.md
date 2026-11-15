<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use guard clauses for terminal cases

`guard-clauses` · Lint rule, built on `eslint/no-else-return` · off by default, with options `[{"allowElseIf":false}]`

Legacy independently configurable check, disabled by default because no-else already rejects every else branch. Avoid else after a return. Exit the conditional flow as soon as you can. Most else blocks after a terminal statement are superfluous.

A chain of if/else/else if keeps extra conditions in mind, especially when nested. Reserving conditional blocks for special cases emphasises the nominal path and makes it easier to evolve.

## What to write instead

Drop the else after the return and continue the main path.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/no-else-return -- <the concrete reason this line needs it>
```
