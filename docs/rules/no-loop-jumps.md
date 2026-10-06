<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Replace loop jumps with selection or focused operations

`no-loop-jumps` · Custom lint rule `architecture/no-loop-jumps` · error by default

Do not use break, continue, or labelled statements by default. Use find/some for searches, filter stable collections before effectful iteration, or extract a focused helper that returns its result. Switch cases also return rather than break. Document a scoped exception when an alternative is genuinely worse.

```
Good:
  const matchingProject = projects.find(matchesProject);
  const activeProjects = projects.filter(isProjectActive);
  for (const project of activeProjects) { await publishProject(project); }
```

```
Bad:
  for (const project of projects) {
    if (project.isArchived) continue;
    await publishProject(project);
  }
```

Never replace an exit with a mutable control flag. Filtering eagerly evaluates all predicates before loop effects and may change behavior for state-dependent predicates or unbounded streams. Do not automatically rewrite those cases. This policy favors explicit selection and focused return-based operations over multiple loop exit mechanisms; it does not claim every jump is a bug.

## What to write instead

Replace break and continue with find, filter, some, or a helper that returns.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-loop-jumps -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
const findProject = () => projects.find(matchesProject);
```

### Reported

```ts
for (const project of projects) { if (isArchived) continue; }
```

> Use selection, a dedicated operation, or a focused helper return instead of break, continue, or labels. Preserve evaluation order; never introduce a mutable flag. See rule no-loop-jumps.

```ts
for (const project of projects) { if (isArchived) break; }
```

> Use selection, a dedicated operation, or a focused helper return instead of break, continue, or labels. Preserve evaluation order; never introduce a mutable flag. See rule no-loop-jumps.

```ts
search: for (const project of projects) { break search; }
```

> Use selection, a dedicated operation, or a focused helper return instead of break, continue, or labels. Preserve evaluation order; never introduce a mutable flag. See rule no-loop-jumps.
