<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep conditions free of explicit effects

`pure-conditions` · Lint rule · error by default

Conditions must compute a decision without performing effects. Reject explicit assignment, update, delete, await, yield, construction, and comma sequencing inside if/loop/ternary tests, switch discriminants/case tests, and short-circuit boolean expressions. Calls and getters are presumed pure by this syntax check, not proven pure. Do not hide an effect in a called predicate just to bypass the rule.

```
Good: const project = await loadProject(); if (isNullish(project)) return unavailable;
Bad: if ((project = loadProject()) !== undefined) { publishProject(project); }
Bad: if (await hasProjectAccess()) { publishProject(project); }
```

Move effectful acquisition before the decision. Function bodies created in a condition execute later and are not checked as immediate effects; directly invoked function bodies are checked. No automatic rewrite changes evaluation order. Explicit effects in logical default expressions are also rejected; ordinary value-producing fallback calls remain allowed.

## What to write instead

Compute the effect into a const first, then test the const.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line pure-conditions -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
if (hasAccess(project)) { publish(project); }
```

```ts
const isReady = hasAccess(project) && isProjectActive(project);
```

```ts
if (registerPredicate(() => { count++; })) { publish(); }
```

```ts
const label = suppliedName ?? getDefaultName();
```

```ts
const publish = async () => { if (isReady) { await publishProject(); } };
```

### Reported

```ts
if (project = loadProject()) { publish(project); }
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.

```ts
if (count++ > 0) { publish(); }
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.

```ts
if (delete project.name) { publish(); }
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.

```ts
const publish = async () => { if (await hasAccess(project)) { publishProject(); } };
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.

```ts
const ready = isReady && count++;
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.

```ts
const label = (count++, isReady) ? 'Ready' : 'Other';
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.

```ts
if ((() => { count++; return isReady; })()) { publish(); }
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.

```ts
if (new Project()) { publish(); }
```

> Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions.
