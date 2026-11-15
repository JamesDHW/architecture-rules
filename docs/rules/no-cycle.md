<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Forbid circular dependencies

`no-cycle` · Lint rule, built on `import/no-cycle` · error by default

Keep file and package dependency graphs acyclic. If two modules depend on each other, extract the shared concept or reverse an effectful dependency through an injected capability rather than retaining the cycle.

A cycle makes neither module independently understandable and obscures initialization order.

## What to write instead

Break the cycle: extract the shared concept into its own module, or inject the dependency.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line import/no-cycle -- <the concrete reason this line needs it>
```
