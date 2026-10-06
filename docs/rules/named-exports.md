<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Prefer named exports

`named-exports` · Oxlint rule `import/no-default-export` · error by default

Use named exports wherever the surrounding framework permits them. Use a default export only when a framework requires one. Configuration files (*.config.ts, .mts, .cts, .js, .mjs, .cjs) are exempt: build and test tools load their configuration from the default export.

Named exports keep identifiers consistent between their definitions and imports, which makes references easier to search, navigate, and refactor.

## What to write instead

Export by name: export const createProject = …

## When to suppress

A tool or framework loads the module from its default export. Configuration files are already exempt.

```ts
// oxlint-disable-next-line import/no-default-export -- <the concrete reason this line needs it>
```
