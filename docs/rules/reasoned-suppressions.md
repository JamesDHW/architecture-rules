<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep lint exceptions narrow and explained

`reasoned-suppressions` · Structural check; lint comments cannot suppress it

Use named-rule disable-line or disable-next-line comments with a nonempty -- reason. Do not use file-wide disables or inline rule reconfiguration to change architecture policy. Structural checks cannot be suppressed by lint comments. The runtime also reports unused directives as errors.

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### A reason that names no cost

```ts
// oxlint-disable-next-line architecture/no-let -- needed
let retryCount = 0;
```

Any non-empty reason passes. Say concretely what complying would cost on this line, so a reviewer can judge it.

No rule reports this; review has to catch it.
