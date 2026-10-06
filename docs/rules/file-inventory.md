<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Account for compiler-selected source files

`file-inventory` · Structural check; lint comments cannot suppress it

Inventory only source files in the configured TypeScript programs. Do not scan unrelated repository files or require allowlists for documentation, assets, configuration or build outputs. Selected source must exist on disk; selected managed symlinks and root escapes are rejected. Dependency-install libraries are not application source.
