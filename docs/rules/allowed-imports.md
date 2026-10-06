<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Respect architectural import permissions

`allowed-imports` · Custom lint rule `architecture/allowed-imports` · error by default

Import only capabilities allowed for the importing file's architectural type. Internal edges are checked against resolved target types, external packages against explicit specifier patterns, built-ins against normalized names, and assets against explicit paths. Omission grants no permission. Re-exports and type-only imports are dependencies too. Nonliteral module loading requires a reasoned exception. Dynamic runtime loaders/eval and transitive function purity are not proved by this check. The architecture runner supplies resolved edge diagnostics; direct plugin use alone does not enforce this policy.

## What to write instead

Import only what this file type allows (architecture-check explain <file> lists it): move the code to a file type that may import it, or inject the dependency.

## When to suppress

A module is loaded by a path known only at runtime, such as a plugin named in configuration.

```ts
// oxlint-disable-next-line architecture/allowed-imports -- <the concrete reason this line needs it>
```
