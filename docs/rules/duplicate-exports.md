<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Export each value once

`duplicate-exports` · Dead-code check · error by default

Export a value under one name. Two names for the same value split its callers and make renames incomplete.

## What to write instead

Keep one export name and update the importers of the other.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line duplicate-exports -- <the concrete reason this line needs it>
```
