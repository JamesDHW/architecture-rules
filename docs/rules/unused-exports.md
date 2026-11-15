<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Export only what is imported

`unused-exports` · Dead-code check · error by default

Export a value only when another file imports it. An export that nothing imports, including one used only inside its own file, widens the module's surface for no caller. Entry files are checked too: only the exports their layer's `entry.exports` names count as used from outside.

## What to write instead

Remove the export keyword, or delete the value if nothing in its file uses it either.

## When to make an exception

Something outside the program reads this one export, and the layer's entry exports cannot name it.

```ts
// architecture-disable-next-line unused-exports -- <the concrete reason this line needs it>
```
