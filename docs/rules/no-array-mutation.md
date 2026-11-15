<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Build new arrays instead of changing them in place

`no-array-mutation` · Lint rule · error by default

Do not change arrays in place with push, pop, shift, unshift, splice, sort, reverse, fill or copyWithin. Build the value you need instead: map, filter and flatMap for transformations, Object.fromEntries for lookups, Array.fromAsync for one-at-a-time asynchronous work, toSorted, toReversed and toSpliced for reordering, and an iterator (values()) to consume items one by one.

```
Good: const failures = (await Array.fromAsync(checks, runCheck)).filter(isFailure);
Bad:  const failures = []; for (const check of checks) { failures.push(await runCheck(check)); }
```

*.state.ts modules, which hold long-lived state, are exempt. Where in-place change is measurably faster and that matters, use a reasoned suppression that names the measurement. The check is by method name, so a non-array method with the same name (a canvas context's fill) needs a suppression too.

## What to write instead

Build a new array with map, filter, flatMap, a spread, toSorted or Array.fromAsync instead of changing one in place.

## When to suppress

In-place change is measurably faster on a hot path; name the measurement in the reason.

```ts
// oxlint-disable-next-line architecture/no-array-mutation -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**transformations**

```ts
const names = projects.filter(isVisible).map((project) => project.name);
```

**non-mutating reorder**

```ts
const ordered = runs.toSorted(byDate).toReversed();
```

**sequential async**

```ts
const results = await Array.fromAsync(checks, runCheck);
```

**computed access**

```ts
items['push'](value);
```

**plain function named push**

```ts
push(value);
```

**map registry calls are another rule's concern**

```ts
registry.set(id, value);
registry.delete(id);
```

**state module** · File: `outputBuffer.state.ts`

```ts
export const createOutputBuffer = () => {
  const chunks: string[] = [];
  return { append: (text: string) => { chunks.push(text); } };
};
```

### Reported

**push**

```ts
const failures: string[] = [];
failures.push('x');
```

> Do not change an array in place with {{method}}. Use {{replacement}}. See rule no-array-mutation.

**push on a property path**

```ts
state.items.push(item);
```

> Do not change an array in place with {{method}}. Use {{replacement}}. See rule no-array-mutation.

**shift on a split result**

```ts
const lines = text.split('\n');
const first = lines.shift();
```

> Do not change an array in place with {{method}}. Use {{replacement}}. See rule no-array-mutation.

**sort in place**

```ts
runs.sort(byDate);
```

> Do not change an array in place with {{method}}. Use {{replacement}}. See rule no-array-mutation.

**splice**

```ts
items.splice(0, 1);
```

> Do not change an array in place with {{method}}. Use {{replacement}}. See rule no-array-mutation.

**reverse**

```ts
items.reverse();
```

> Do not change an array in place with {{method}}. Use {{replacement}}. See rule no-array-mutation.
