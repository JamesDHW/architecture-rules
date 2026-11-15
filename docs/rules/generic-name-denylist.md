<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Use complete, domain-specific names

`generic-name-denylist` · Oxlint rule `eslint/id-denylist` · error by default, with options `["data","item","obj","arr","tmp"]`

Name values by their domain role using complete words. Do not use generic placeholders such as data, item, obj, arr, or tmp.

Specific names carry context into every use and remove the need to inspect a declaration to infer what a generic placeholder represents.

## What to write instead

Name the value by its domain role, such as projectSummary instead of data or item.

## When to suppress

An external API forces the name, such as a field called data; suppress at the single place that touches it.

```ts
// oxlint-disable-next-line eslint/id-denylist -- <the concrete reason this line needs it>
```
