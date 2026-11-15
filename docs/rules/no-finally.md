<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Sequence normalized operations and cleanup without finally

`no-finally` · Lint rule · error by default

Do not use finally, including in the error adapter. Sequence the operation and its cleanup explicitly through the adapter:

```
Good:
  const result = await tryCatch(() => operation(session));
  const closeResult = await tryCatch(() => session.close());
  return resolveSessionOutcome(result, closeResult);
```

```
Bad:
  try { return await operation(session); }
  finally { await session.close(); }
```

Await operation completion before cleanup. The adapter must normalize every thrown value and rejection; do not assume this sequence remains safe if that contract changes. Explicit sequencing avoids a second cleanup syntax and prevents finally from silently replacing the operation's result with a cleanup failure. Only an explicit scoped exception may allow an unavoidable API case.

## What to write instead

Run the operation and then its cleanup through tryCatch, in sequence, and combine both results.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-finally -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
try { loadProject(); } catch (caught) { reportFailure(caught); }
```

### Reported

```ts
try { loadProject(); } finally { closeSession(); }
```

> Sequence the operation and its cleanup through the error adapter; do not let cleanup hide an operation failure. See rule no-finally.
