<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not hide a name from an enclosing scope

`no-shadow` · Lint rule, built on `eslint/no-shadow` · error by default

Do not declare a name that hides one from an enclosing scope, including an import. A destructured prop named like an imported style or helper silently replaces it inside the component, and both are often strings, so TypeScript cannot tell.

## What to write instead

Rename the inner binding so it doesn't hide the outer one.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-shadow -- <the concrete reason this line needs it>
```
