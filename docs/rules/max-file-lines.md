<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Limit source files to 200 lines

`max-file-lines` · Oxlint rule `eslint/max-lines` · error by default, with options `[{"max":200,"skipBlankLines":true,"skipComments":true}]`

Warn when a source file exceeds 150 lines and report an error when it exceeds 200 lines. Split the file by cohesive responsibility rather than moving arbitrary ranges of code.

A bounded file can be understood without navigating a large collection of unrelated concepts. The warning leaves room to choose a meaningful extraction before size becomes a hard failure.

## What to write instead

Split the file by responsibility: move one cohesive concept into its own file.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line eslint/max-lines -- <the concrete reason this line needs it>
```
