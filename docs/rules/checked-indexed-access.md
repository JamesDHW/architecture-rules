<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Check every indexed collection access

`checked-indexed-access` · TypeScript compiler options `{"noUncheckedIndexedAccess":true}`

Treat array and record lookups as potentially undefined unless the type system can prove the requested entry exists.

Runtime collections do not guarantee that an index or arbitrary key is present. I want that uncertainty represented directly in the type.
