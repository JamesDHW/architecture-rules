<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use type aliases for object shapes

`type-aliases` · Oxlint rule `typescript/consistent-type-definitions` · error by default, with options `["type"]`

Use type aliases for object shapes as well as unions, functions, and composed types. Use an interface only at a boundary where a third-party API requires declaration or module augmentation.

One type-definition syntax removes an arbitrary choice and composes consistently with unions.

## What to write instead

Declare the shape with type instead of interface.

## When to suppress

Module augmentation of a third-party interface, which only an interface can do.

```ts
// oxlint-disable-next-line typescript/consistent-type-definitions -- <the concrete reason this line needs it>
```
