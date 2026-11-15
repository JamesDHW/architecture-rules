<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use strict booleans directly

`direct-boolean-conditions` · Oxlint rule `typescript/no-unnecessary-boolean-literal-compare` · error by default, with options `[{"allowComparingNullableBooleansToTrue":true,"allowComparingNullableBooleansToFalse":true}]`

```
Good: if (project.isArchived) { showArchiveNotice(project); }
Bad for a boolean property: if (project.isArchived === true) { showArchiveNotice(project); }
Good for a nullable property: if (project?.isArchived === true) { showArchiveNotice(); }
```

Use !predicate for the opposite strict-boolean case. Preserve explicit comparisons for nullable booleans; replacing them with truthiness can lose null/undefined distinctions. Negated exceptional guards remain preferred over inverting the function to put its successful path inside a positive condition.

## What to write instead

Test the boolean directly (if (isReady)); keep === true only for a nullable boolean.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- <the concrete reason this line needs it>
```
