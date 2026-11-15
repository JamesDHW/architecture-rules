<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Return from switch cases in a focused operation

`terminal-switch-cases` · Lint rule · error by default

Use switches for behavior dispatch over a discriminant, not switch(true) or switch(false) predicate chains. Ordered predicates belong in guard clauses. Each nonempty case body must end in a return. Extract dispatch into a focused helper when shared work must follow it. Do not break out of the switch to continue the caller. Adjacent empty labels may share the next terminal body; a trailing empty label has no body and is not allowed. Case braces are optional, except where lexical declarations need their own scope.

```
Good:
  switch (request.status) {
    case "idle":
    case "loading":
      return showPendingRequest();
    case "success":
      return showProject(request.project);
    case "failure":
      return showFailure(request.error);
    default:
      return request satisfies never;
  }
```

```
Bad:
  switch (request.status) {
    case "success":
      publishProject(request.project);
      break;
  }
  recordRequestHandled();
```

This syntactic rule checks the final statement, including a final nested block. It does not prove type exhaustiveness or infer whether every path through a nested conditional returns. Express nested decisions in a named operation returned by the case. Closed-domain coverage is checked separately.

## What to write instead

Return from every case; move shared follow-up work into a helper the case returns.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/terminal-switch-cases -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
const handle = () => { switch (status) { case 'idle': case 'loading': return pending; default: return ready; } };
```

```ts
const handle = () => { switch (status) { case 'idle': { return pending; } default: { return ready; } } };
```

```ts
const handle = () => { switch (status) { case 'idle': return pending; default: return status satisfies never; } };
```

### Reported

```ts
switch (status) { case 'idle': publish(); break; }
```

> End this switch case with a return. Extract dispatch into a focused helper when shared work follows. See rule terminal-switch-cases.

```ts
switch (status) { case 'idle': }
```

> End this switch case with a return. Extract dispatch into a focused helper when shared work follows. See rule terminal-switch-cases.

```ts
const handle = () => { switch (status) { case 'idle': if (isReady) return ready; } };
```

> End this switch case with a return. Extract dispatch into a focused helper when shared work follows. See rule terminal-switch-cases.

```ts
const handle = () => { switch (status) { case 'idle': { publish(); { return pending; } } case 'ready': { if (isReady) return ready; } } };
```

> End this switch case with a return. Extract dispatch into a focused helper when shared work follows. See rule terminal-switch-cases.

```ts
const handle = () => { switch (true) { case isReady: return ready; } };
```

> Use ordered guard clauses instead of switch(true/false). See rule terminal-switch-cases.

```ts
const handle = () => { switch (false) { case isReady: return ready; } };
```

> Use ordered guard clauses instead of switch(true/false). See rule terminal-switch-cases.
