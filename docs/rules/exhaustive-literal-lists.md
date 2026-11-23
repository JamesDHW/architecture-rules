<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# List every member when a literal list satisfies a union

`exhaustive-literal-lists` · Program check, with type information · error by default

A literal list written with satisfies readonly T[], where T is a union of literals, must list every member of T. satisfies on its own proves only that each listed value is a member, so a member added to T later is silently missing from the list, and code built from it (a schema, a select's options, a database check constraint) rejects or hides it.

```
Good: const STATUSES = ["draft", "active", "archived"] as const satisfies readonly Status[];
      const EDITABLE: readonly Status[] = ["draft"];
Bad:  const STATUSES = ["draft", "active"] as const satisfies readonly Status[];
```

A deliberate subset is declared with a type annotation instead, which says "some of" rather than "all of". The check uses the compiler's types, so the union may be declared anywhere.

## What to write instead

Add the missing members, or declare a deliberate subset with a type annotation instead of satisfies.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line exhaustive-literal-lists -- <the concrete reason this line needs it>
```
