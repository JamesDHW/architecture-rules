<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use async/await for sequential asynchronous flow

`async-await` · Lint rule, built on `promise/prefer-await-to-then` · error by default, with options `[{"strict":true}]`

Express sequential asynchronous work with async/await, not .then, .catch, or .finally. Ban those methods even after an await or yield. Use explicit Promise combinators such as Promise.all when intentional concurrency is the operation being expressed.

async/await presents asynchronous control flow in the same readable sequence as synchronous code.

## What to write instead

Use await instead of .then, .catch or .finally; use Promise.all for intentional concurrency.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line async-await -- <the concrete reason this line needs it>
```
