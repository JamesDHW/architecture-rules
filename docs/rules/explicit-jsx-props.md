<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Pass JSX props explicitly

`explicit-jsx-props` · Oxlint rule `react/jsx-props-no-spreading` · error by default, with options `[{"html":"ignore","custom":"enforce"}]`

List application-component props explicitly at the call site rather than spreading an object. Prop spreading is allowed only inside a low-level pass-through primitive whose explicit purpose is forwarding native attributes.

Explicit props expose a component's inputs where it is used and prevent unrelated object fields from silently becoming part of the call.

## What to write instead

List the props at the call site instead of spreading an object.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line react/jsx-props-no-spreading -- <the concrete reason this line needs it>
```
