<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep exceptions narrow and explained

`reasoned-suppressions` · Structural check; lint comments cannot suppress it

Make an exception for one line with `// architecture-disable-next-line <rule-id> -- <reason>` above it, or `// architecture-disable-line <rule-id> -- <reason>` at its end. Name architecture rule ids and give a nonempty reason. File-wide exceptions, exceptions without a reason and the underlying engines' own disable or configuration comments are rejected. Structural and compiler checks cannot be excepted. An exception that covers no finding is an error.

## What to write instead

Fix the finding; if you can't, write `// architecture-disable-next-line <rule-id> -- <the concrete reason>` above the line.

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### A reason that names no cost

```ts
// architecture-disable-next-line no-let -- needed
let retryCount = 0;
```

Any non-empty reason passes. Say concretely what complying would cost on this line, so a reviewer can judge it.

No rule reports this; review has to catch it.
