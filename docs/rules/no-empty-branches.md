<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Remove empty conditional branches

`no-empty-branches` · Lint rule · error by default

Do not leave empty or comment-only conditional branches. Remove the meaningless decision or express an exhaustive no-op with a terminal return. Framework-required empty function stubs are outside this rule. Stacked switch labels remain allowed because they select the following terminal body.

```
Good: if (shouldNotifyProjectOwner) { notifyProjectOwner(); }
Good: case "idle": return;
Bad: if (isProjectArchived) { /* Intentionally do nothing. */ }
```

Comments do not turn an empty conditional into meaningful executable behavior. Do not introduce a dummy statement or helper merely to evade this rule.

## What to write instead

Delete the empty branch, or return explicitly for an exhaustive no-op case.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-empty-branches -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
if (isReady) { publish(); }
```

```ts
const noop = () => {};
```

```ts
const handle = () => { switch (status) { case 'idle': return; } };
```

### Reported

```ts
if (isReady) {}
```

> Remove this empty branch; comments do not make a no-op meaningful. Use return for an exhaustive no-op case. See rule no-empty-branches.

```ts
if (isReady) { /* deliberate */ }
```

> Remove this empty branch; comments do not make a no-op meaningful. Use return for an exhaustive no-op case. See rule no-empty-branches.

```ts
if (isReady) { publish(); } else {}
```

> Remove this empty branch; comments do not make a no-op meaningful. Use return for an exhaustive no-op case. See rule no-empty-branches.

```ts
if (isReady);
```

> Remove this empty branch; comments do not make a no-op meaningful. Use return for an exhaustive no-op case. See rule no-empty-branches.

```ts
switch (status) {}
```

> Remove this empty branch; comments do not make a no-op meaningful. Use return for an exhaustive no-op case. See rule no-empty-branches.
