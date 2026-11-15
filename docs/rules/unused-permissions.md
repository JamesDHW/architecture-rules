<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Grant only the dependencies a layer uses

`unused-permissions` · Configuration check, set project-wide · error by default

Every entry in a layer's dependencies (internal layers, external specifiers and assets) must be used by at least one import from that layer. An unused grant is dead configuration: it reads as a decision that the layer needs the dependency, and it lets the next import through without anyone deciding again.

## What to write instead

Remove the grant from the layer's dependencies in architecture.config.ts.
