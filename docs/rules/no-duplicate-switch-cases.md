<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not repeat switch case values

`no-duplicate-switch-cases` · Oxlint rule `eslint/no-duplicate-case` · error by default

Give each case a distinct value. Good: case 'idle': return ready; case 'loading': return pending; Bad: two case 'idle' labels. A repeated case cannot select its later branch.

## What to write instead

Remove or merge the repeated case value.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/no-duplicate-case -- <the concrete reason this line needs it>
```
