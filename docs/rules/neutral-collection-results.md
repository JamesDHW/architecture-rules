<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use collection operations' neutral empty behavior

`neutral-collection-results` · Lint rule, built on `unicorn/no-useless-length-check` · error by default

Do not branch on emptiness merely to reproduce an operation's empty result.

```
Good: return projects.map(getProjectName);
Bad: if (projects.length === 0) return []; return projects.map(getProjectName);
Keep a guard that expresses different behavior, such as returning ProjectListEmptyError.
```

Native enforcement covers recognized useless length checks, not every adjacent return pattern or arbitrary helper. Additional cases remain review obligations. It is a syntax convention for standard collection methods, not proof that a custom object with a map/filter method implements Array semantics.

## What to write instead

Drop the emptiness check: map, filter and similar operations already return an empty result.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line neutral-collection-results -- <the concrete reason this line needs it>
```
