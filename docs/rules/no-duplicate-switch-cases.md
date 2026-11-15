<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not repeat switch case values

`no-duplicate-switch-cases` · Lint rule, built on `eslint/no-duplicate-case` · error by default

Give each case a distinct value. Good: case 'idle': return ready; case 'loading': return pending; Bad: two case 'idle' labels. A repeated case cannot select its later branch.

## What to write instead

Remove or merge the repeated case value.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-duplicate-switch-cases -- <the concrete reason this line needs it>
```
