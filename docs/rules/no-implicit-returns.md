<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Require every code path to return

`no-implicit-returns` · TypeScript compiler options `{"noImplicitReturns":true}`

Enable noImplicitReturns so a function with a return type cannot fall off the end of a branch without returning.

I do not want undefined to appear from a missing return when the function claimed it would produce a value.
