<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Confine raw exceptions to explicit adapters

`no-raw-exceptions` · Lint rule · error by default

Return errors as values instead of throwing or catching exceptions. Keep the project's error adapter, such as a tryCatch helper and its error types, in a layer of its own and turn this rule off there with a reason. Everywhere else, wrap a throwing or rejecting external operation with that adapter immediately and branch on the returned error.

```
Good: const project = await tryCatch(() => loadExternalProject(projectId));
      if (project instanceof Error) return project;
Bad: try { return await loadExternalProject(projectId); }
     catch (caught) { return new ProjectLoadError({ cause: caught }); }
```

A single required API case outside the adapter can use a reasoned line suppression. This syntax check does not prove that every potentially throwing external call is wrapped.

## What to write instead

Return an error value; wrap a call that can throw or reject in tryCatch or tryCatchAsync, and keep raw try/throw in the error adapter.

## When to make an exception

A framework requires a throw, such as a router redirect, at the one place it is required.

```ts
// architecture-disable-next-line no-raw-exceptions -- <the concrete reason this line needs it>
```

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### Leaving a rejecting call unwrapped

```ts
const loadProject = async (projectId: string): Promise<Project | ProjectError> => {
  const response = await httpClient.get(`/projects/${projectId}`);
  return parseProject(response.body);
};
```

There is no try or throw to report, so the rule passes, but a network failure rejects past every caller that branches on returned errors. Wrap the call: await tryCatchAsync(() => httpClient.get(url)).

No rule reports this; review has to catch it.

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
const result = await tryCatch(() => loadProject());
```

### Reported

```ts
throw new ProjectError();
```

> Return errors as values. Raw throw and catch belong in the error adapter layer. See rule no-raw-exceptions.

```ts
try { loadProject(); } catch (caught) { reportFailure(caught); }
```

> Return errors as values. Raw throw and catch belong in the error adapter layer. See rule no-raw-exceptions.
