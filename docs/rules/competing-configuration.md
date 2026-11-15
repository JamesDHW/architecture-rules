<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep one source of truth for checks

`competing-configuration` · Configuration check, set project-wide · error by default

The checker owns linting and dead-code analysis, configured in architecture.config.ts. Another linter's or dead-code tool's configuration in the project root (such as .eslintrc, eslint.config.js, .oxlintrc.json, biome.json or knip.json) gives a second, different answer, and editors show its warnings instead of the checker's. Formatters are not affected.

## What to write instead

Move the settings you need into architecture.config.ts and delete the other configuration, or turn this rule off with a reason while you migrate.
