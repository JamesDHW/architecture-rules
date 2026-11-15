<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use explicit conditions for non-boolean values

`explicit-conditions` · Oxlint rule `typescript/strict-boolean-expressions` · error by default, with options `[{"allowString":false,"allowNumber":false,"allowNullableObject":false}]`

Only boolean-typed expressions may be tested directly.

Compare strings, numbers, objects, and nullish values explicitly according to the intended condition. Approved type-guard predicates may express nullishness or presence. Plain booleans are tested directly; redundant literal comparisons are handled by direct-boolean-conditions.

Optional chaining remains allowed for value access and defaults: const displayName = project?.name ?? "Anonymous"; if (project?.isArchived === true) { showArchiveNotice(); } Do not test a nullable boolean through truthiness: if (project?.isArchived) { showArchiveNotice(); }

The approved-guard compound-condition exception is defined by named-predicates; it does not require replacing standalone null/undefined comparisons.

Prefer:

if (projects.length > 0) {} if (project !== undefined) {}

Avoid:

if (projects.length) {} if (project) {}

I prefer the exact condition to be visible at the point of use rather than requiring the reader to reconstruct JavaScript truthiness semantics.

## What to write instead

Compare explicitly: name.length > 0, count !== 0, project !== undefined.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/strict-boolean-expressions -- <the concrete reason this line needs it>
```
