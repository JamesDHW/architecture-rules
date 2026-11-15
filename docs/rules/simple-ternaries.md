<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep ternaries simple and side-effect-free

`simple-ternaries` · Custom lint rule `architecture/simple-ternaries` · error by default

Prefer a ternary for one ordinary simple value choice, rather than an if-return plus a fallback return. Good: return isSaving ? "Saving…" : "Save";

```
Bad for ordinary label selection: if (isSaving) return "Saving…"; return "Save";
Exceptional/error guards, exhaustive dispatch, and component render states take
precedence. This preference is reviewed semantically; the AST checker does not
invent a rule that converts every pair of returns into a ternary.
```

Do not nest ternaries or use assignments, updates, delete, await, yield, construction, or comma sequences in its branches. Calls are allowed: this syntax check does not prove that calls or property getters are pure. Purity of called operations remains a separate architectural obligation. No arbitrary expression-length limit is used as a proxy for understandability.

Use guard returns for whole component states. Do not return a root ternary with a JSX branch, including an implicit arrow-function return. Small binary fragment choices nested in JSX remain allowed. Good: <Button>{isSaving ? <Spinner /> : <SaveIcon />}</Button>. Bad: return isLoading ? <LoadingPage /> : <ProjectDetails project={project} />. This syntax check cannot prove the semantic size of a render state or detect JSX hidden behind arbitrary calls.

Discarded ternaries are rejected by explicit-conditional-effects. Value-producing calls remain allowed, but effectful calls do not become acceptable merely because a surrounding expression consumes or forwards their result.

Bodies of functions created inside a branch execute later and are not checked as branch effects. Immediately invoked function bodies are checked.

## What to write instead

Use an if with return, or a named function, instead of a nested or effectful ternary.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/simple-ternaries -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
const label = isSaving ? "Saving" : "Save";
```

```ts
const price = isMember ? calculateMemberPrice(order) : calculateStandardPrice(order);
```

```ts
const amount = isMember ? order.price * discount : order.price;
```

```ts
const handleSave = isLocal ? () => { saveCount++; } : saveRemote;
```

```ts
const result = checkReady() ? getProject() : undefined;
```

```tsx
const SaveButton = () => <Button>{isSaving ? <Spinner /> : <SaveIcon />}</Button>;
```

```tsx
const ProjectPage = () => { if (isLoading) return <LoadingPage />; return <ProjectDetails />; };
```

### Reported

```ts
const result = isReady ? (isMember ? member : guest) : unknown;
```

> Use explicit control flow instead of nested ternaries. See rule simple-ternaries.

```ts
const result = (isReady ? isMember : isGuest) ? member : guest;
```

> Use explicit control flow instead of nested ternaries. See rule simple-ternaries.

```ts
const result = isReady ? (count = 1) : 0;
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```ts
const result = isReady ? count++ : 0;
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```ts
const result = isReady ? remove(delete project.name) : false;
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```ts
const result = isReady ? new Project() : undefined;
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```ts
const result = isReady ? (save(), project) : undefined;
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```ts
const load = async () => isReady ? await fetchProject() : undefined;
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```ts
function* load() { return isReady ? yield project : undefined; }
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```ts
const result = isReady ? (() => { count++; return count; })() : 0;
```

> Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.

```tsx
const ProjectPage = () => isLoading ? <LoadingPage /> : <ProjectDetails />;
```

> Use guard returns for whole render states; keep JSX ternaries inside small fragments. See rule simple-ternaries.

```tsx
const ProjectPage = () => { return isLoading ? <LoadingPage /> : <ProjectDetails />; };
```

> Use guard returns for whole render states; keep JSX ternaries inside small fragments. See rule simple-ternaries.
