<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Declare every package that is used

`unlisted-dependencies` · Dead-code check, set project-wide · error by default

Every package a file imports must be declared in package.json. Production layers may only use dependencies; devDependencies are for development layers. An undeclared package works only by accident of what else is installed.

## What to write instead

Add the package to package.json: to dependencies when a production layer imports it.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line unlisted-dependencies -- <the concrete reason this line needs it>
```
