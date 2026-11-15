<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use nullish coalescing for missing-value defaults

`nullish-defaults` · Lint rule, built on `typescript/prefer-nullish-coalescing` · error by default

Use ?? when supplying a fallback for missing data. Do not use || for value defaulting; reserve it for boolean logic.

Nullish coalescing states that only null or undefined is missing and preserves intentional values such as an empty string, zero, and false.

```
Good: const displayName = suppliedName ?? "Anonymous";
Bad: const displayName = isNullish(suppliedName) ? "Anonymous" : suppliedName;
```

Explicit branches remain appropriate when null and undefined mean different things. Empty-string fallback is a named policy, not implicit truthiness. Native enforcement may not recognize project-specific guard calls; review those redundant helper-based ternaries against the same policy.

## What to write instead

Use ?? to default a missing value.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line nullish-defaults -- <the concrete reason this line needs it>
```
