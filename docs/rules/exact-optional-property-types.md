<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Distinguish omitted properties from explicit undefined

`exact-optional-property-types` · TypeScript compiler options `{"exactOptionalPropertyTypes":true}`

Enable exactOptionalPropertyTypes so an optional property cannot be assigned undefined unless undefined is part of its written type.

I use omitted, undefined, and null as different instructions. Optional properties should mean "not supplied", not "possibly undefined".
