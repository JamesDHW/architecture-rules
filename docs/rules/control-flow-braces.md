<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use braces except for single-line terminal guards

`control-flow-braces` · Custom lint rule `architecture/control-flow-braces` · error by default

Require braces around conditional and loop bodies, except for single-line terminal guards. An if may omit braces only when its body is a return, throw, break, or continue and the entire if occupies one line. Loops always use braces. This brace exception does not permit throw outside approved error adapters, or break/continue without a no-loop-jumps exception. Else remains forbidden by no-else. A brace rule fixture may exercise those statements independently, but the complete default profile still rejects them.

```
Good:
  if (project === undefined) return new ProjectNotFoundError();
  if (project.isArchived) {
    sendArchiveNotification(project);
  }
  const activeProjects = projects.filter(isProjectActive);
  for (const project of activeProjects) {
    sendActiveNotification(project);
  }
```

```
Bad:
  if (project.isArchived) sendArchiveNotification(project);
  if (project === undefined)
    return new ProjectNotFoundError();
  for (const project of projects) sendActiveNotification(project);
```

Compact guards make terminal checks easy to scan. Braces around other bodies make their scope explicit and reduce accidentally unconditional additions.

## What to write instead

Add braces around the body; only a single-line terminal guard such as `if (isDone) return result;` may omit them.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/control-flow-braces -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
const findProject = () => { if (isMissing) return undefined; };
```

```ts
const stop = () => { if (isInvalid) throw new Error(); };
```

```ts
for (const project of projects) { if (project.isArchived) continue; }
```

```ts
while (isRunning) { if (isFinished) break; }
```

```ts
if (isReady) { startProject(); }
```

```ts
if (isMissing) {
 return undefined;
 }
```

```ts
for (;;) { break; }
```

```ts
for (const projectId in projects) { visitProject(projectId); }
```

```ts
do { visitProject(); } while (isRunning);
```

```ts
while (isRunning) {}
```

### Reported

```ts
if (isReady) startProject();
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
if (isMissing)
 return undefined;
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
if (
 isMissing
) return undefined;
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
if (isMissing) return (
 undefined
);
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
if (isReady);
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
for (const project of projects) visitProject(project);
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
for (const projectId in projects) visitProject(projectId);
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
for (;;) break;
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
while (isRunning) continue;
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
do visitProject(); while (isRunning);
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.

```ts
if (isReady) if (isMissing) return undefined;
```

> Use braces except for single-line terminal if guards. See rule control-flow-braces.
