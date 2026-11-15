<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use non-null assertions

`no-non-null-assertion` · Oxlint rule `typescript/no-non-null-assertion` · error by default

Do not use any, non-null assertions, unchecked type assertions, @ts-ignore, or @ts-expect-error in application code. Accept untrusted values as unknown and validate or narrow them. If unsafe interoperability is unavoidable, isolate it in a descriptively named boundary adapter and document the reason.

Escape hatches move type errors away from their cause and make readers trust claims the compiler cannot verify.

## What to write instead

Handle the missing case with a guard or ?? instead of asserting with !.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/no-non-null-assertion -- <the concrete reason this line needs it>
```
