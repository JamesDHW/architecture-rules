<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use narrowing type assertions

`no-unsafe-type-assertion` · Lint rule, built on `typescript/no-unsafe-type-assertion` · off by default

Off by default: no-type-assertions already rejects every assertion, so this rule would only report the same casts a second time. Enable it in a layer that relaxes no-type-assertions (for example a boundary adapter) to keep rejecting the unsafe subset: assertions that narrow a value to a type the compiler cannot verify.

Escape hatches move type errors away from their cause and make readers trust claims the compiler cannot verify.

## What to write instead

Validate the value instead of asserting a narrower type.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-unsafe-type-assertion -- <the concrete reason this line needs it>
```
