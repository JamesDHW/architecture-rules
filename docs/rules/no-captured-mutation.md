<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep long-lived state in *.state.ts modules

`no-captured-mutation` · Custom lint rule `architecture/no-captured-mutation` · error by default

Do not change an array, object, Map or Set from a function other than the one that created it. State that must outlive a function call (a registry of live connections, requests waiting for a reply) lives in a *.state.ts module, which exports a factory of named operations. Building a value inside one function call is not long-lived state and is outside this rule; no-array-mutation covers how to build it.

```
Bad (a closure keeps changing it):
  const sockets: WebSocket[] = [];
  socket.addEventListener("open", () => sockets.push(socket));
Good (pendingRequests.state.ts):
  export const createPendingRequests = () => {
    const pending = new Map<string, PendingRequest>();
    return { add: (id, request) => { pending.set(id, request); }, ... };
  };
```

The check is syntactic: it follows containers created with [], {}, new Map, new Set, new WeakMap or new WeakSet. It does not see mutation through function parameters or objects returned by other calls.

## What to write instead

Build a new value inside the function, or move long-lived state into a *.state.ts module.

## When to suppress

A third-party API hands you a callback that must record into state you created; prefer a *.state.ts module first.

```ts
// oxlint-disable-next-line architecture/no-captured-mutation -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**building a value inside one call**

```ts
const collect = (checks: readonly number[]) => {
  const failures: number[] = [];
  for (const check of checks) { failures.push(check); }
  return failures;
};
```

**module setup at the top level**

```ts
const routes: string[] = [];
routes.push('home');
```

**mutation through a parameter is out of scope**

```ts
const add = (list: number[]) => { list.push(1); };
```

**a call result is not a tracked container**

```ts
const create = (database: Db) => async () => database.update(runs).set({ status: 'done' });
```

**method named add on a dependency**

```ts
const create = (dependencies: Deps) => (id: string) => { dependencies.pendingRequests.add(id); };
```

**computed method access is out of scope**

```ts
const make = () => {
  const pending = new Map<string, number>();
  return (id: string) => { pending['set'](id, 1); };
};
```

**a container from an unknown constructor**

```ts
const make = () => {
  const pending = new Registry();
  return (id: string) => { pending.add(id); };
};
```

**state module** · File: `pendingRequests.state.ts`

```ts
export const createPendingRequests = () => {
  const pending = new Map<string, number>();
  return { add: (id: string) => { pending.set(id, 1); } };
};
```

### Reported

**array cell changed by a closure**

```ts
const link = () => {
  const sockets: WebSocket[] = [];
  return (socket: WebSocket) => { sockets.splice(0, sockets.length, socket); };
};
```

> '{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.

**map registry outside a state module**

```ts
const hub = () => {
  const pending = new Map<string, number>();
  return { add: (id: string) => { pending.set(id, 1); } };
};
```

> '{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.

**module-level cache changed inside a function**

```ts
const cache = new Map<string, number>();
export const remember = (key: string) => { cache.set(key, 1); };
```

> '{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.

**object box assigned from a closure**

```ts
const make = () => {
  const box = { current: 0 };
  return () => { box.current = 1; };
};
```

> '{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.

**counter incremented from a closure**

```ts
const make = () => {
  const state = { count: 0 };
  return () => { state.count++; };
};
```

> '{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.

**property deleted from a closure**

```ts
const make = () => {
  const flags = { ready: true };
  return () => { delete flags.ready; };
};
```

> '{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.

**typed and asserted container**

```ts
const make = () => {
  const seen = new Set<string>() as Set<string>;
  return (id: string) => { seen.add(id); };
};
```

> '{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.
