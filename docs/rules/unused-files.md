<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Delete files nothing uses

`unused-files` · Dead-code check · error by default

Every source file in the TypeScript programs must be reachable by imports from an entry: a layer marked `entry` in architecture.config.ts. A file nothing reaches is dead code: it still has to be read, reviewed and kept compiling, and it misleads whoever finds it into thinking it matters.

## What to write instead

Delete the file, or, if something outside the program loads it, mark its layer as an entry with a reason.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line unused-files -- <the concrete reason this line needs it>
```
