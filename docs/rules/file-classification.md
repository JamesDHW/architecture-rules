<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Assign each source file exactly one architectural type

`file-classification` · Structural check; lint comments cannot suppress it

Select by root-relative path patterns minus explicit per-type exclusions. Zero or multiple matching types are errors. Naming validates after selection and never changes membership. Defaults are inherited policy, not another file type. Actual overlaps are checked on every run, not inferred by merging glob overrides.
