<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Warn when a source file exceeds 150 lines

`max-file-lines-warn` · Lint rule · warn by default, with options `[{"max":150,"skipBlankLines":true,"skipComments":true}]`

Warn when a source file exceeds 150 lines and report an error when it exceeds 200 lines. Split the file by cohesive responsibility rather than moving arbitrary ranges of code.

A bounded file can be understood without navigating a large collection of unrelated concepts. The warning leaves room to choose a meaningful extraction before size becomes a hard failure.

## What to write instead

Split the file by responsibility: move one cohesive concept into its own file.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line max-file-lines-warn -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**at the configured maximum** · Options: `[{"max":3}]`

```ts
const a = 1;
const b = 2;
const c = 3;
```

**blank lines skipped by default** · Options: `[{"max":3}]`

```ts
const a = 1;

const b = 2;

const c = 3;
```

**comment-only lines skipped by default** · Options: `[{"max":2}]`

```ts
// header
const a = 1;
/* block */
const b = 2;
```

**trailing comment on a code line is still one counted line** · Options: `[{"max":2}]`

```ts
const a = 1; // note
const b = 2;
```

**inner and closing lines of a block comment are skipped** · Options: `[{"max":2}]`

```ts
const a = 1; /* opens after code
   continues
*/
const b = 2;
```

**a block comment line shared with code still counts** · Options: `[{"max":1}]`

```ts
/* opens alone
*/ const a = 1;
```

### Reported

**one line over the configured maximum** · Options: `[{"max":2}]`

```ts
const a = 1;
const b = 2;
const c = 3;
```

> File has {{actual}} lines; warning starts at {{max}}. Split by cohesive responsibility. See rule max-file-lines-warn.

**blank lines count when skipBlankLines is false** · Options: `[{"max":3,"skipBlankLines":false}]`

```ts
const a = 1;

const b = 2;
const c = 3;
```

> File has {{actual}} lines; warning starts at {{max}}. Split by cohesive responsibility. See rule max-file-lines-warn.

**comment-only lines count when skipComments is false** · Options: `[{"max":2,"skipComments":false}]`

```ts
// header
const a = 1;
const b = 2;
```

> File has {{actual}} lines; warning starts at {{max}}. Split by cohesive responsibility. See rule max-file-lines-warn.

**the message reports the counted lines and the maximum** · Options: `[{"max":1}]`

```ts
/*
 * header
 */
const a = 1;
const b = 2;
```

> File has 2 lines; warning starts at 1. Split by cohesive responsibility. See rule max-file-lines-warn.
