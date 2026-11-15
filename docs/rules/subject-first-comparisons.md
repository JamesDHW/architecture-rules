<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Put the comparison subject before the literal

`subject-first-comparisons` · Lint rule, built on `eslint/yoda` · error by default, with options `["never",{"exceptRange":true}]`

```
Good: project.status === "archived"
Bad: "archived" === project.status
Allow conventional two-sided ranges, such as 0 <= retryCount && retryCount <= 3.
Use semantic named constants when the limits express policy. Native enforcement
recognizes literals, not whether arbitrary identifiers are semantic constants.
Subject-first comparisons read as a question about the domain value; readable
range notation is an intentional exception.
```

## What to write instead

Put the value being tested first: project.status === "archived".

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line subject-first-comparisons -- <the concrete reason this line needs it>
```
