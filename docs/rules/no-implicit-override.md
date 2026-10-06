<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Mark override methods explicitly

`no-implicit-override` · TypeScript compiler options `{"noImplicitOverride":true}`

Enable noImplicitOverride so a method that overrides a base member must be marked override.

Renaming or removing a base member should fail at the override site rather than silently leaving a leftover method behind.
