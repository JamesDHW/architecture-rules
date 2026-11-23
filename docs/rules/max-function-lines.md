<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Limit functions to 80 lines

`max-function-lines` · Lint rule, built on `eslint/max-lines-per-function` · error by default, with options `[{"max":80,"skipBlankLines":true,"skipComments":true,"IIFEs":false}]`

Warn when a function is longer than 40 lines and report an error above 80, not counting blank and comment-only lines. Extract named steps: a function either coordinates steps or carries out one of them.

File limits do not bound functions: one factory that returns an object of methods, or one component with every render state inline, can fill a whole file under the file limit. Nested functions count towards the function that contains them, so such a factory is measured whole. Immediately invoked functions are not counted on their own.

Test suites are the usual exception: a describe() callback holds many short cases, so a tests layer turns these rules off with that reason.

## What to write instead

Extract named steps into their own functions, so this one either coordinates them or carries out one.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line max-function-lines -- <the concrete reason this line needs it>
```
