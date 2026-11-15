<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Declare only packages that are used

`unused-dependencies` · Dead-code check, set project-wide · error by default

Every package in package.json must be imported by a file in the TypeScript programs, run by a package.json script, or used by a tool's configuration. A package nothing uses still costs install time and supply-chain risk. A package used without being imported, such as one a framework loads at runtime, is allowed by name in the rule's options, with a reason.

## What to write instead

Remove the package from package.json, or allow it by name with a reason: "unused-dependencies": { options: { allow: ["sharp"] }, reason: "…" }.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line unused-dependencies -- <the concrete reason this line needs it>
```
