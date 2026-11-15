<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not return unsafe types

`no-unsafe-return` · Lint rule, built on `typescript/no-unsafe-return` · error by default

Do not use any, non-null assertions, unchecked type assertions, @ts-ignore, or @ts-expect-error in application code. Accept untrusted values as unknown and validate or narrow them. If unsafe interoperability is unavoidable, isolate it in a descriptively named boundary adapter and document the reason.

Escape hatches move type errors away from their cause and make readers trust claims the compiler cannot verify.

## What to write instead

Validate or narrow the any value to the declared return type before returning it.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-unsafe-return -- <the concrete reason this line needs it>
```
