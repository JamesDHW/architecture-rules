<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use stable list keys

`jsx-key` · Lint rule, built on `react/jsx-key` · error by default

List items need a stable key so React can reconcile identity across renders. Missing or index keys cause subtle state bugs when the list changes.

## What to write instead

Give each list item a key from its stable domain id.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line react/jsx-key -- <the concrete reason this line needs it>
```
