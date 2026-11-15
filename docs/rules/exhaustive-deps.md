<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Declare exhaustive effect dependencies

`exhaustive-deps` · Lint rule, built on `react/exhaustive-deps` · error by default

Effect and memoization dependency lists that omit reactive values hide stale closures and missed updates. List every value the callback closes over.

## What to write instead

List every value the callback uses in its dependency array.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line exhaustive-deps -- <the concrete reason this line needs it>
```
