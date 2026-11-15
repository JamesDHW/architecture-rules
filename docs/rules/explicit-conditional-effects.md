<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use statements for conditional effects

`explicit-conditional-effects` · Lint rule, built on `eslint/no-unused-expressions` · error by default, with options `[{"allowShortCircuit":false,"allowTernary":false,"allowTaggedTemplates":true,"enforceForJSX":true,"ignoreDirectives":true}]`

Use if statements for conditional effects, not discarded logical or ternary expressions. Reserve && and || for boolean computation and approved JSX presence rendering; reserve ?? for missing-value defaults.

```
Good: if (isArchived) { sendArchiveNotification(project); }
Bad: isArchived && sendArchiveNotification(project);
Bad: isArchived ? sendArchiveNotification(project) : sendActiveNotification(project);
```

Native enforcement rejects discarded expressions. Ordinary calls in consumed expressions may be pure calculations; their purity cannot be proved here. An unused callback return does not justify hiding effects in a logical expression. Review that case against this policy even if lint cannot infer that a caller discards the result. Directives such as "use client" remain valid.

## What to write instead

Use an if statement for a conditional effect instead of an && or ternary expression.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/no-unused-expressions -- <the concrete reason this line needs it>
```
