<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use reduce only for simple folds

`reduce-simple-folds` · Lint rule, built on `unicorn/no-array-reduce` · error by default, with options `[{"allowSimpleOperations":true}]`

Use reduce only when the result is genuinely a single simple fold, such as a sum, minimum, or maximum. Use dedicated operations such as map, filter, or a descriptively named helper for transformation, selection, grouping, indexing, and multi-purpose accumulation.

General accumulators force readers to simulate each iteration and track the accumulator's shape.

## What to write instead

Use map, filter, Object.fromEntries or a named helper; keep reduce for sums, minimums and maximums.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line unicorn/no-array-reduce -- <the concrete reason this line needs it>
```
