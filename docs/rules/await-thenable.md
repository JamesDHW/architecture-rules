<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Only await thenable values

`await-thenable` · Oxlint rule `typescript/await-thenable` · error by default

Awaiting a non-promise is either a mistake or hides that the callee is synchronous. Only await values that are actually thenable.

## What to write instead

Remove the await: the value is not a promise.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/await-thenable -- <the concrete reason this line needs it>
```
