<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use @ts-ignore or @ts-expect-error

`no-ts-comments` · Oxlint rule `typescript/ban-ts-comment` · error by default, with options `[{"ts-expect-error":true,"ts-ignore":true,"ts-nocheck":true}]`

Do not use any, non-null assertions, unchecked type assertions, @ts-ignore, or @ts-expect-error in application code. Accept untrusted values as unknown and validate or narrow them. If unsafe interoperability is unavoidable, isolate it in a descriptively named boundary adapter and document the reason.

Escape hatches move type errors away from their cause and make readers trust claims the compiler cannot verify.

## What to write instead

Fix the type error, or validate the value, instead of silencing the compiler.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/ban-ts-comment -- <the concrete reason this line needs it>
```
