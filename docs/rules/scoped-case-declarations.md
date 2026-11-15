<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Scope lexical declarations within switch cases

`scoped-case-declarations` · Lint rule, built on `eslint/no-case-declarations` · error by default

Case braces are optional for simple returns. Good: case 'success': { const label = formatProject(project); return label; } Bad: the same lexical declaration in an unbraced case. Braces keep lexical bindings from leaking into other cases' shared scope.

## What to write instead

Wrap the case body in braces when it declares a binding.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line scoped-case-declarations -- <the concrete reason this line needs it>
```
