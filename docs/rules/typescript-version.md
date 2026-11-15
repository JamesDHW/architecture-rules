<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use the TypeScript version the checker uses

`typescript-version` · Configuration check, set project-wide · error by default

The project must declare the same TypeScript version the checker runs, or not declare TypeScript at all. With another version, the editor reports different compiler errors from the check.

## What to write instead

Set typescript in package.json to the checker's version, or remove it.
