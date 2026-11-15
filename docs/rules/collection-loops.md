<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use for...of as the default loop form

`collection-loops` · Lint rule · error by default

Use for...of or for await...of for intentional iteration. Prefer dedicated collection operations for direct transformations and searches. Do not use classic for, for...in, while, or do...while by default. Require a documented scoped exception for an API or algorithm that genuinely needs another form.

```
Good:
  for (const project of projects) { await publishProject(project); }
  for (const [projectIndex, project] of projects.entries()) {
    publishProjectAtPosition(project, projectIndex);
  }
  for (const [projectId, project] of Object.entries(projectsById)) {
    publishIndexedProject(projectId, project);
  }
```

```
Bad:
  for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
    publishProject(projects[projectIndex]);
  }
  while (hasPendingJobs()) { processNextJob(); }
```

A single collection-loop syntax exposes the element directly, avoids index bookkeeping, and aligns with immutable bindings and checked collection access.

## What to write instead

Use for...of, for await...of, or a collection method such as map, filter, find or some.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line collection-loops -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
for (const project of projects) { publishProject(project); }
```

```ts
const publish = async () => { for await (const project of projects) { await publishProject(project); } };
```

### Reported

```ts
for (;;) {}
```

> Use for...of, for await...of, or a dedicated collection operation. Other loop forms require an explicit scoped exception. See rule collection-loops.

```ts
for (const projectId in projects) {}
```

> Use for...of, for await...of, or a dedicated collection operation. Other loop forms require an explicit scoped exception. See rule collection-loops.

```ts
while (isReady) {}
```

> Use for...of, for await...of, or a dedicated collection operation. Other loop forms require an explicit scoped exception. See rule collection-loops.

```ts
do {} while (isReady);
```

> Use for...of, for await...of, or a dedicated collection operation. Other loop forms require an explicit scoped exception. See rule collection-loops.
