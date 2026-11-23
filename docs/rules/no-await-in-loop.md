<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not await inside a loop

`no-await-in-loop` · Lint rule, built on `eslint/no-await-in-loop` · error by default

Do not await inside a loop body. Each iteration then waits for the previous one, so a list of independent operations (queries, requests, file reads) runs one at a time, and a list of database rows becomes one round trip per row. Start the operations together and await them with Promise.all, or give the port a batch operation that does the work in one call.

```
Good: const sent = await Promise.all(recipients.map((recipient) => sendEmail(recipient)));
      const users = await stores.users.findByIds(userIds);
Bad:  for (const recipient of recipients) { await sendEmail(recipient); }
```

When the order matters, or the work must not run at once (a rate-limited provider, steps that depend on each other), keep the loop and say why in a line exception.

## What to write instead

Map the items to promises and await Promise.all, or use a batch operation; keep a sequential loop only with a reason.

## When to make an exception

Each step depends on the previous one, or the work must not run concurrently, such as calls to a rate-limited provider.

```ts
// architecture-disable-next-line no-await-in-loop -- <the concrete reason this line needs it>
```
