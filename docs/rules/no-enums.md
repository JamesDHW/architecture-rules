<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use literal unions instead of enums

`no-enums` · Custom lint rule `architecture/no-enums` · error by default

Do not declare TypeScript enums. Represent a closed set with a literal union. Add an as const object only when runtime access to named values is genuinely useful.

Literal unions work directly as discriminants, preserve exact serializable values, and avoid the additional runtime and type semantics of enums.

## What to write instead

Use a union of string literals instead of an enum.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-enums -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**literal union**

```ts
type ProjectStatus = "draft" | "active" | "archived";
```

### Reported

**enum declaration**

```ts
enum ProjectStatus { Draft, Active }
```

> Do not declare TypeScript enums. Use a literal union. See rule no-enums.
