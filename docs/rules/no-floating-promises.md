<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not ignore promises

`no-floating-promises` · Lint rule, built on `typescript/no-floating-promises` · error by default

Floating promises hide failures and make asynchronous control flow harder to follow. Await, return, or explicitly void a promise at the point it is created.

## What to write instead

Await the promise or return it; when you deliberately discard it, handle its failure first.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/no-floating-promises -- <the concrete reason this line needs it>
```

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### Discarding a promise that can fail with void

```ts
const handleSaveClick = (): void => {
  void saveProject(project);
};
```

void satisfies the rule, but a rejection is never seen. Await the promise in an async handler and show the failure, or handle the failure before discarding it.

No rule reports this; review has to catch it.
