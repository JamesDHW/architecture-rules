import { defineRule } from "../core/defineRule.js";

export const unusedPermissionsRule = defineRule({
  id: "unused-permissions",
  title: "Grant only the dependencies a layer uses",
  description: `
Every entry in a layer's dependencies (internal layers, external specifiers and
assets) must be used by at least one import from that layer. An unused grant is
dead configuration: it reads as a decision that the layer needs the dependency,
and it lets the next import through without anyone deciding again.
  `.trim(),
  instead: "Remove the grant from the layer's dependencies in architecture.config.ts.",
  enforcement: { type: "configuration", configuration: "error" },
});

export const unmatchedPatternsRule = defineRule({
  id: "unmatched-patterns",
  title: "Select files with patterns that match",
  description: `
Every pattern in a layer's files and entry.files must match at least one
source file of the TypeScript programs. A pattern that matches nothing is dead
configuration, often a typo or a leftover from a move, and it hides where files
are expected to live. Exclude patterns are not checked, since they guard
against files that do not exist yet, and neither are a generated layer's files,
which may not exist before a build.
  `.trim(),
  instead: "Fix or remove the pattern in architecture.config.ts.",
  enforcement: { type: "configuration", configuration: "error" },
});

export const competingConfigurationRule = defineRule({
  id: "competing-configuration",
  title: "Keep one source of truth for checks",
  description: `
The checker owns linting and dead-code analysis, configured in
architecture.config.ts. Another linter's or dead-code tool's configuration in
the project root (such as .eslintrc, eslint.config.js, .oxlintrc.json,
biome.json or knip.json) gives a second, different answer, and editors show its
warnings instead of the checker's. Formatters are not affected.
  `.trim(),
  instead: "Move the settings you need into architecture.config.ts and delete the other configuration, or turn this rule off with a reason while you migrate.",
  enforcement: { type: "configuration", configuration: "error" },
});

export const typescriptVersionRule = defineRule({
  id: "typescript-version",
  title: "Use the TypeScript version the checker uses",
  description: `
The project must declare the same TypeScript version the checker runs, or not
declare TypeScript at all. With another version, the editor reports different
compiler errors from the check.
  `.trim(),
  instead: "Set typescript in package.json to the checker's version, or remove it.",
  enforcement: { type: "configuration", configuration: "error" },
});
