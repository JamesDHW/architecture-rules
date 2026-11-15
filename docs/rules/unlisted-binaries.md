<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Declare every command the scripts run

`unlisted-binaries` · Dead-code check, set project-wide · error by default

Every command a package.json script runs must come from a declared package, or be allowed by name in the rule's options when the machine provides it.

## What to write instead

Add the package that provides the command, or allow a system command by name with a reason.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line unlisted-binaries -- <the concrete reason this line needs it>
```
