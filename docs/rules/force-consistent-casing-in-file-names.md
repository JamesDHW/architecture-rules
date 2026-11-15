<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Match import paths to on-disk file casing

`force-consistent-casing-in-file-names` · TypeScript compiler options `{"forceConsistentCasingInFileNames":true}`

Enable forceConsistentCasingInFileNames so import specifiers must match the casing of the files they resolve to.

Case-insensitive filesystems hide these mismatches until the same import fails on a case-sensitive filesystem.
