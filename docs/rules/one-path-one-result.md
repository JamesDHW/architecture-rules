<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Combine adjacent guards with the same terminal outcome

`one-path-one-result` · Custom lint rule `architecture/one-path-one-result` · warn by default

Combine adjacent terminal if guards with identical return expressions into a named predicate when they represent the same outcome. Preserve short-circuit predicate order. Only guards whose complete body is a single return qualify.

```
Good:
  const isUnavailable = isMissing || isArchived;
  if (isUnavailable) return unavailableProject;
```

```
Bad:
  if (isMissing) return unavailableProject;
  if (isArchived) return unavailableProject;
```

Independent conditional effects are not duplicate outcomes: both may execute, and intervening work must not move. This rule never requests merging those branches. Matching tokens identify candidates, not proof of shared domain meaning. Distinct policies may need distinct semantic names even when their current values coincide. No automatic rewrite is supplied.

## What to write instead

Combine adjacent guards that return the same value into one named condition.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/one-path-one-result -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
const notify = () => { if (isOwner) { notifyProject(); } if (isAdministrator) { notifyProject(); } };
```

```ts
const notify = () => { if (isOwner) { notifyProject(); } checkpoint(); if (isAdministrator) { notifyProject(); } };
```

```ts
const getLabel = () => { if (isMissing) return 'Missing'; if (isArchived) return 'Archived'; };
```

```ts
const getLabel = () => { if (isMissing) return 'Not available'; if (isArchived) return 'Not  available'; };
```

```ts
const getLabel = () => { if (isMissing) return unavailable; checkpoint(); if (isArchived) return unavailable; };
```

```ts
const getLabel = () => { if (isMissing) { checkpoint(); return unavailable; } if (isArchived) return unavailable; };
```

```ts
const getLabel = () => { const isUnavailable = isMissing || isArchived; if (isUnavailable) return unavailable; };
```

```ts
const getLabel = () => { if (isMissing) { return unavailable; } else { return unavailable; } };
```

### Reported

```ts
const getLabel = () => { if (isMissing) return unavailable; if (isArchived) return unavailable; };
```

> These adjacent terminal guards return the same expression. Combine their conditions into a named predicate if they represent the same outcome, preserving evaluation order. See rule one-path-one-result.

```ts
const getLabel = () => { if (isMissing) { return unavailable; } if (isArchived) return unavailable; };
```

> These adjacent terminal guards return the same expression. Combine their conditions into a named predicate if they represent the same outcome, preserving evaluation order. See rule one-path-one-result.

```ts
const getLabel = () => { if (isMissing) return formatLabel( project ); if (isArchived) return formatLabel(project); };
```

> These adjacent terminal guards return the same expression. Combine their conditions into a named predicate if they represent the same outcome, preserving evaluation order. See rule one-path-one-result.

```ts
const notify = () => { if (isMissing) return; if (isArchived) return; };
```

> These adjacent terminal guards return the same expression. Combine their conditions into a named predicate if they represent the same outcome, preserving evaluation order. See rule one-path-one-result.

```ts
const getLabel = () => { switch (status) { case 'ready': if (isMissing) return unavailable; if (isArchived) return unavailable; return available; } };
```

> These adjacent terminal guards return the same expression. Combine their conditions into a named predicate if they represent the same outcome, preserving evaluation order. See rule one-path-one-result.
