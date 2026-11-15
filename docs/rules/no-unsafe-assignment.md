<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not assign unsafe types

`no-unsafe-assignment` · Oxlint rule `typescript/no-unsafe-assignment` · error by default

Do not use any, non-null assertions, unchecked type assertions, @ts-ignore, or @ts-expect-error in application code. Accept untrusted values as unknown and validate or narrow them. If unsafe interoperability is unavoidable, isolate it in a descriptively named boundary adapter and document the reason.

Escape hatches move type errors away from their cause and make readers trust claims the compiler cannot verify.

## What to write instead

Validate or narrow the any value to a known type before assigning it.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/no-unsafe-assignment -- <the concrete reason this line needs it>
```
