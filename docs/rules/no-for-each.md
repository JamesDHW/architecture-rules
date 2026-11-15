<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use forEach

`no-for-each` · Lint rule, built on `unicorn/no-array-for-each` · error by default

Use map, filter, or another dedicated transformation for direct value transformations. Use for...of when intentionally sequencing effects. Do not use forEach, including with asynchronous callbacks.

The iteration form should reveal whether code directly transforms data, constructs a result, or performs effects. forEach discards callback results and misleadingly accepts async callbacks without awaiting them.

## What to write instead

Use map or filter to build values, or for...of to perform effects.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line unicorn/no-array-for-each -- <the concrete reason this line needs it>
```
