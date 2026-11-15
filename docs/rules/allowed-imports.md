<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Respect architectural import permissions

`allowed-imports` · Lint rule · error by default

Import only what the importing file's layer lists in its dependencies. Internal edges are checked against the resolved target's layer, packages and node: built-ins against the external specifier patterns, and assets against explicit paths. Omission grants no permission. Re-exports and type-only imports are dependencies too. Nonliteral module loading requires a reasoned exception. Dynamic runtime loaders/eval and transitive function purity are not proved by this check. The architecture runner supplies resolved edge diagnostics; direct plugin use alone does not enforce this policy.

## What to write instead

Import only what this file type allows (architecture-check explain <file> lists it): move the code to a file type that may import it, or inject the dependency.

## When to make an exception

A module is loaded by a path known only at runtime, such as a plugin named in configuration.

```ts
// architecture-disable-next-line allowed-imports -- <the concrete reason this line needs it>
```
