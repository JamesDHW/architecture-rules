<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep values immutable

`prefer-const` · Oxlint rule `eslint/prefer-const` · error by default

Do not reassign bindings. Callers can understand an immutable transformation without tracking changes over time.

## What to write instead

Declare the binding with const.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/prefer-const -- <the concrete reason this line needs it>
```
