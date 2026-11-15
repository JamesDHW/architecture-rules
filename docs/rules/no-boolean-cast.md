<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not cast into a boolean

`no-boolean-cast` · Lint rule, built on `eslint/no-implicit-coercion` · error by default, with options `[{"boolean":true,"number":false,"string":false}]`

Casting to boolean, implicitly or explicitly, hides the intended condition. Truthiness is not consistent across languages and runtimes, which leads to unwanted results.

Compare the value according to the intended condition. Do not coerce with !! or Boolean().

## What to write instead

Compare explicitly instead of using !! or Boolean(): projects.length > 0.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/no-implicit-coercion -- <the concrete reason this line needs it>
```
