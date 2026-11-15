<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Export only types that are imported

`unused-types` · Dead-code check · error by default

Export a type only when another file imports it. Unused exported types are dead code that still shapes how readers think the module is used.

## What to write instead

Remove the export keyword from the type, or delete the type if its file does not use it either.

## When to make an exception

The type is part of a public API that its layer's entry exports cannot name.

```ts
// architecture-disable-next-line unused-types -- <the concrete reason this line needs it>
```
