<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Define only the terms the code uses

`unused-terms` · Configuration check, set project-wide · error by default

Every glossary must be followed by at least one layer, and every term must appear in at least one name declared in those layers. A term nothing uses is dead vocabulary: it reads as part of the domain while the code says otherwise, and it blocks its avoided words for no benefit.

## What to write instead

Remove the term, or the glossary, from architecture.config.ts; or name the code after it.
