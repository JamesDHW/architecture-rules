<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Ship only code production uses

`production-reachability` · Dead-code check · error by default

A file or export in a production layer must be used by production code, not only by development layers (tests, stories, scripts, tool configuration). Code that only tests call is dead in production: it is tested, so it looks alive.

## What to write instead

Delete the code and its tests, move it into a development layer, or use it from production code.

## When to make an exception

Production deliberately keeps this export for development use, such as a test seam the build strips.

```ts
// architecture-disable-next-line production-reachability -- <the concrete reason this line needs it>
```
