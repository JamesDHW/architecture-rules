<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Handle discriminated unions exhaustively

`switch-exhaustiveness` · Lint rule, built on `typescript/switch-exhaustiveness-check` · error by default, with options `[{"considerDefaultExhaustiveForUnions":false,"allowDefaultCaseForExhaustiveSwitch":true}]`

Complete dispatches over a discriminated union must prove at compile time that all variants are handled. A targeted narrowing if that intentionally handles only one variant remains allowed; it is not a complete dispatch.

For a closed-domain default, use return request satisfies never or return a helper call whose parameter is never. Do not use a generic error fallback that accepts newly added variants. Open string/number domains may have a meaningful fallback; validate untrusted values before closed-domain dispatch.

```
Good: default: return request satisfies never;
Bad: default: return new UnsupportedRequestError();
```

A handler for part of a union takes the narrowed type, so its signature states what it handles and a new variant in that part still fails to compile:

```
Good: type AdminAction = Extract<AppAction, { readonly type: "adminPanel" | "adminForm" }>;
      const reduceAdmin = (state: AppState, action: AdminAction) => { switch (action.type) { ... } };
Bad: const reduceAdmin = (state: AppState, action: AppAction) => { switch (action.type) { ...; default: return null; } };
```

A union you do not own, such as NodeJS.Platform, is an open domain: use a single targeted if, or a Partial<Record<...>> lookup with a ?? fallback.

Native enforcement verifies missing union cases even when a default exists. It does not require an explicit never default or prove a helper's parameter contract; those parts remain review obligations checked with TypeScript.

Exhaustiveness turns additions to a state model into useful compiler errors at every affected decision point.

## What to write instead

Handle every variant and end with default: return value satisfies never.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/switch-exhaustiveness-check -- <the concrete reason this line needs it>
```
