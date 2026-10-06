<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not fall through switch cases

`no-fallthrough-cases-in-switch` · TypeScript compiler options `{"noFallthroughCasesInSwitch":true}`

Enable noFallthroughCasesInSwitch so a case must break, return, or throw unless it is empty and intentionally grouped.

Accidental fallthrough is too easy to miss when reading variant-specific logic. Grouped empty cases remain valid.
