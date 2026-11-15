<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Resolve every import the same way everywhere

`unresolved-imports` · Dead-code check · error by default

The dead-code analysis must resolve every import TypeScript resolves. When it cannot, usually because of a path alias or a custom resolver, its view of what is used is incomplete, so files and exports can look unused when they are not.

## What to write instead

Use an import TypeScript and the bundler resolve the same way, such as a tsconfig paths alias, or report the specifier as a bug.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line unresolved-imports -- <the concrete reason this line needs it>
```
