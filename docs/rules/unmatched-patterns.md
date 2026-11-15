<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Select files with patterns that match

`unmatched-patterns` · Configuration check, set project-wide · error by default

Every pattern in a layer's files and entry.files must match at least one source file of the TypeScript programs. A pattern that matches nothing is dead configuration, often a typo or a leftover from a move, and it hides where files are expected to live. Exclude patterns are not checked, since they guard against files that do not exist yet, and neither are a generated layer's files, which may not exist before a build.

## What to write instead

Fix or remove the pattern in architecture.config.ts.
