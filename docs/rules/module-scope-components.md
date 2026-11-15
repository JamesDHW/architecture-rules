<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Declare components and hooks at module scope

`module-scope-components` · Lint rule, built on `react/no-unstable-nested-components` · error by default

Do not define a React component or hook inside another function. Declare it at module scope and pass every required value through explicit props or hook inputs.

Nested component declarations recreate component identity during rendering.

## What to write instead

Declare the component or hook at module scope and pass values in as props.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line react/no-unstable-nested-components -- <the concrete reason this line needs it>
```
