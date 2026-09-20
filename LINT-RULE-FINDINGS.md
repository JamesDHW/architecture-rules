# Incorrectly configured lint rules

These remaining `pnpm lint` errors look like the rule (or its native options) firing on code the written policy already allows. Counts are from the current tree after genuine violations were fixed.

## 1. `typescript/no-unnecessary-condition` (`checkTypePredicates: true`)

**Architecture rule:** `unnecessary-conditions`  
**Option:** `{ checkTypePredicates: true }`  
**Hits:** 61, all the same message: `Type predicate is unnecessary as the parameter type already satisfies the predicate.`

`checkTypePredicates` is the experimental part. It treats a `value is X` annotation as redundant even when the parameter is `unknown` and the predicate is the public contract.

```ts
export const isWorkError = (value: unknown): value is WorkError => {
  return value instanceof WorkError;
};
```

```ts
const isUnknownRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
```

```ts
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
};
```

```ts
return value.filter((entry): entry is string => typeof entry === "string");
```

Why this is wrong: a type predicate on `unknown` (or on `unknown[]` after `Array.isArray`) is how callers get narrowing. Removing `value is WorkError` would make every `if (isWorkError(result))` stop narrowing. The written rule is about dead *conditions* (`if (project === undefined)` when `project` is already `Project`), not about banning type-guard annotations.

**Suggested fix:** drop `checkTypePredicates`, or ignore that message until tsgolint matches typescript-eslint’s intended behavior.

## 2. `typescript/switch-exhaustiveness-check` (`considerDefaultExhaustiveForUnions: false`)

**Architecture rule:** `switch-exhaustiveness`  
**Hits:** 28

The written policy allows two things the native check rejects:

- a targeted / partial dispatch (if or switch that handles one subset and otherwise declines)
- a meaningful fallback on an open string/number domain

### Partial dispatchers

Split reducers and key handlers take a wide union, handle their slice, and return `null` / `false` / `0` for everything else. That is the same pattern as “a targeted narrowing if,” which the rule text explicitly allows.

```ts
export const reduceAdmin = (state: AppState, action: AppAction): AppState | null => {
  switch (action.type) {
    case "adminPanel":
      return { /* ... */ };
    case "adminForm":
      return { /* ... */ };
    // ...only admin actions...
    default:
      return null;
  }
};
```

```ts
export const adminListCount = (admin: AdminState): number => {
  switch (admin.panel) {
    case "menu":
      return ADMIN_MENU.length;
    case "packages":
      return admin.packages.length;
    // ...list panels only...
    default:
      return 0;
  }
};
```

The checker reports every unlisted `AppAction` / panel (for `reduceAdmin`, dozens of create/inbox/grant actions). Listing them all as `return null` would destroy the reason these files are split.

### Open domains

`NodeJS.Platform` is not a closed application union. The rule text says open string domains may have a meaningful fallback.

```ts
switch (platform) {
  case "darwin":
    return [/* launchctl instructions */].join("\n");
  default:
    return [/* systemd instructions */].join("\n");
}
```

The error asks for `aix` | `android` | `cygwin` | `freebsd` | `haiku` | `linux` | `netbsd` | `openbsd` | `sunos` | `win32`. Linux is already the default. Enumerating Node’s platform list is not exhaustiveness of a domain we own.

**Suggested fix:** keep `considerDefaultExhaustiveForUnions: true` for open domains / partial dispatch, or only enable the check when a default uses `satisfies never`. Do not treat `default: return null` on a split reducer as a complete dispatch.

## 3. `architecture/no-binding-alias`

**Hits:** 3

The rule reports every `Identifier = Identifier` assignment. That is broader than “do not give an existing binding another name.”

### Snapshot, not an alias

```ts
const turnIndex = numberField(record, "turnIndex") ?? 0;
lastTurnIndex = turnIndex;
```

`lastTurnIndex` is stored for a later event (`turn_end` falls back to it). The names mean different times. This is not `const isEnabled = shouldEnable`.

### Clearing a binding

```ts
compactStart = undefined;
```

`undefined` is parsed as an identifier, so the rule treats this as aliasing `undefined`. It is resetting optional state after compact ends.

### Public schema alias

```ts
export const registeredPackageSchema = listedPackageSchema;
```

This is a protocol export name, not a local synonym. `import { listedPackageSchema as registeredPackageSchema }` is also banned by the same rule. There is no allowed way to publish one schema under two names.

**Suggested fix:** skip assignment to `undefined` / `null`; skip `export const` re-exports; require the names to be synonymous, not merely identifier-to-identifier.

## 4. `architecture/no-boolean-assignment-branches`

**Hits:** 1 — `packages/core/src/broker/load.ts`

```ts
const registry = await readRegistry();
if (isWorkError(registry)) {
  loaded = true;
  return;
}
```

`loaded` is a module-level “we already attempted load” cache. It is not a boolean *result* computed in a branch and read later as a stand-in for the predicate (`if (shouldEnable) { isEnabled = true }`). After a failed registry read we still must not retry forever; the flag records that the attempt happened.

**Suggested fix:** allow assignment to a pre-existing module/object field that is not a newly introduced result flag.

## 5. `typescript/prefer-nullish-coalescing` (`nullish-defaults`)

**Hits:** 1 — `packages/core/src/store/drafts.ts`

The written rule says explicit branches remain appropriate when null and undefined mean different things.

```ts
intent: input.intent === undefined ? (existing?.intent ?? "") : input.intent,
authoringSessionId:
  input.authoringSessionId === undefined
    ? (existing?.authoringSessionId ?? null)
    : input.authoringSessionId,
```

This patch object uses “omitted” (`undefined`) vs “set to null/empty.” `input.intent ?? existing?.intent ?? ""` would also replace an explicit `null`. Native `prefer-nullish-coalescing` cannot see that distinction and rewrites every `=== undefined` ternary to `??`.

**Suggested fix:** turn the native rule off for `=== undefined` ternaries, or only flag `||` defaulting and `isNullish(x) ? fallback : x`.

## 6. `architecture/no-type-assertions` and `typescript/no-unsafe-type-assertion`

**Hits:** both on `packages/core/src/broker/load-resolve.ts`

```ts
const hooks = module as unknown as ModuleHooks;
hooks.registerHooks({
  resolve(specifier, context, nextResolve) {
    // remap .js specifiers to .ts for package adapters
  },
});
```

Node’s `module.registerHooks` is not in the public `node:module` types we have. There is no runtime schema to parse; the value is the built-in `module` object. The written unsafe-type policy is for untrusted data (`any`, non-null assertions, `@ts-expect-error`). Forcing a fake validator around `node:module` would not make this safer.

**Suggested fix:** allow a documented adapter assertion at a Node/API boundary, or type this through a tiny `*.d.ts` augmentation so the assertion is unnecessary.
