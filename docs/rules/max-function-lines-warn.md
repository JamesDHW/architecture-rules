<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Warn when a function is longer than 40 lines

`max-function-lines-warn` · Lint rule · warn by default, with options `[{"max":40,"skipBlankLines":true,"skipComments":true}]`

Warn when a function is longer than 40 lines and report an error above 80, not counting blank and comment-only lines. Extract named steps: a function either coordinates steps or carries out one of them.

File limits do not bound functions: one factory that returns an object of methods, or one component with every render state inline, can fill a whole file under the file limit. Nested functions count towards the function that contains them, so such a factory is measured whole. Immediately invoked functions are not counted on their own.

Test suites are the usual exception: a describe() callback holds many short cases, so a tests layer turns these rules off with that reason.

## What to write instead

Extract named steps into their own functions, so this one either coordinates them or carries out one.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line max-function-lines-warn -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**at the configured maximum** · Options: `[{"max":3}]`

```ts
const run = (): number => {
  return 1;
};
```

**blank and comment-only lines skipped** · Options: `[{"max":3}]`

```ts
const run = (): number => {

  // one
  return 1;
};
```

**an immediately invoked function is not counted** · Options: `[{"max":2}]`

```ts
(() => {
  start();
  stop();
})();
```

### Reported

**over the maximum** · Options: `[{"max":3}]`

```ts
const run = (): number => {
  const first = 1;
  const second = 2;
  return first + second;
};
```

> Function has 5 lines; warning starts above 3. Extract named steps. See rule max-function-lines-warn.

**a method is measured from its key** · Options: `[{"max":3}]`

```ts
const store = {
  read() {
    const first = 1;
    const second = 2;
    return first + second;
  },
};
```

> Function has 5 lines; warning starts above 3. Extract named steps. See rule max-function-lines-warn.
