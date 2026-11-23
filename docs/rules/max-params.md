<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Take at most two positional parameters

`max-params` · Lint rule, built on `eslint/max-params` · error by default, with options `[{"max":2}]`

Give a function at most two positional parameters. With more, pass one readonly object and destructure it, so every argument is named at the call site.

```
Good: const sendUpdate = ({ to, subject, body }: Update): Promise<Sent> => { ... };
      sendUpdate({ to: address, subject: message.title, body: message.body });
Bad:  const sendUpdate = (to: string, subject: string, body: string): Promise<Sent> => { ... };
      sendUpdate(address, message.body, message.body);
```

Positional arguments of the same type can be swapped or repeated without a compiler error, and the call site does not say which is which. A destructured object parameter counts as one.

## What to write instead

Take one readonly object parameter and destructure it; callers then name each argument.

## When to make an exception

A framework or library fixes the signature, such as a middleware's (request, response, next).

```ts
// architecture-disable-next-line max-params -- <the concrete reason this line needs it>
```
