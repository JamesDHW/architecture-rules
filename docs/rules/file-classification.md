<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Assign each source file exactly one layer

`file-classification` · Structural check; lint comments cannot suppress it

Select by root-relative path patterns minus explicit per-layer exclusions. Zero or multiple matching layers are errors. Naming validates after selection and never changes membership. Project-wide settings are inherited policy, not another layer. Actual overlaps are checked on every run, not inferred by merging glob overrides.
