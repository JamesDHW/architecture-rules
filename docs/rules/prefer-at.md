<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Check every indexed collection access

`prefer-at` · Lint rule, built on `unicorn/prefer-at` · error by default

Treat array, tuple, and record lookup results as possibly undefined unless the type system proves that the key exists. Prefer .at() for index access so absence is part of the result.

Runtime collections do not guarantee that an index or key exists.

## What to write instead

Use .at(index), so a missing element is part of the result's type.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line unicorn/prefer-at -- <the concrete reason this line needs it>
```
