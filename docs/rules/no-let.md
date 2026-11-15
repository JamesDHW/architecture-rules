<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Declare every binding with const

`no-let` · Lint rule · error by default

Do not declare variables with let. Declare every binding with const and compute a new value instead of reassigning an old one.

```
Good: const visibleProjects = projects.filter(isVisible);
Bad:  let count = 0; count += 1;
```

State that must outlive a function call lives in a *.state.ts module (see rule no-captured-mutation). One-time platform signals such as AbortSignal and Promise replace flags and counters that would otherwise need reassignment.

## What to write instead

Declare with const and compute a new value; keep long-lived state in a *.state.ts module.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-let -- <the concrete reason this line needs it>
```

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### An array used as a variable

```ts
const createRetrier = () => {
  const attempts: number[] = [];
  return () => {
    attempts.push(1);
    return attempts.length;
  };
};
```

The count is still mutable state shared between calls, only hidden in an array. Pass the count as a parameter, or keep the state in a *.state.ts module.

Reported by [`no-captured-mutation`](no-captured-mutation.md).

### An object used as a variable

```ts
const createCounter = () => {
  const counter = { value: 0 };
  return () => {
    counter.value += 1;
    return counter.value;
  };
};
```

Moving the reassignment onto a property keeps the same mutable state. Compute a new value, or keep long-lived state in a *.state.ts module.

Reported by [`no-captured-mutation`](no-captured-mutation.md).

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**const binding**

```ts
const count = 1;
```

**const in for-of**

```ts
for (const item of items) { use(item); }
```

### Reported

**let binding**

```ts
let count = 0;
count += 1;
```

> Declare this with const and compute a new value instead of reassigning. Long-lived state belongs in a *.state.ts module. See rule no-let.

**let without initializer**

```ts
let socket;
```

> Declare this with const and compute a new value instead of reassigning. Long-lived state belongs in a *.state.ts module. See rule no-let.

**let in for-of**

```ts
for (let item of items) { use(item); }
```

> Declare this with const and compute a new value instead of reassigning. Long-lived state belongs in a *.state.ts module. See rule no-let.
