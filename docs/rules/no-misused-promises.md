<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not misuse promises in conditionals or listeners

`no-misused-promises` · Lint rule, built on `typescript/no-misused-promises` · error by default, with options `[{"checksVoidReturn":{"attributes":false}}]`

Promises used as booleans or passed where a callback must finish synchronously are a common source of unhandled asynchronous failures. Treat a promise as asynchronous work, not as a value. JSX props are the exception: React ignores a handler's return value, so an async handler may be passed directly, as in the named-handler example.

## What to write instead

Await the promise and test its result; don't pass an async function where a synchronous callback is expected.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/no-misused-promises -- <the concrete reason this line needs it>
```

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### A wrapper that only hides the promise

```ts
const startAction = (action: () => Promise<void>) => (): void => {
  void action();
};
```

It returns void, so the rule passes, but nothing handles a rejection. Pass the async handler directly where the rule allows it, and handle failures inside it.

No rule reports this; review has to catch it.
