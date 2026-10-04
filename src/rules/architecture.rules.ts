import { defineRule } from "../core/defineRule.js";

export const fileInventoryRule = defineRule({
  id: "file-inventory", title: "Account for compiler-selected source files",
  description: "Inventory only source files in the configured TypeScript programs. Do not scan unrelated repository files or require allowlists for documentation, assets, configuration or build outputs. Selected source must exist on disk; selected managed symlinks and root escapes are rejected. Dependency-install libraries are not application source.",
  enforcement: { type: "architecture" },
});
export const fileClassificationRule = defineRule({
  id: "file-classification", title: "Assign each source file exactly one architectural type",
  description: "Select by root-relative path patterns minus explicit per-type exclusions. Zero or multiple matching types are errors. Naming validates after selection and never changes membership. Defaults are inherited policy, not another file type. Actual overlaps are checked on every run, not inferred by merging glob overrides.",
  enforcement: { type: "architecture" },
});
export const projectMembershipRule = defineRule({
  id: "project-membership", title: "Govern all local TypeScript program sources",
  description: "TypeScript owns scope through files, include, exclude, inherited configuration, allowJs, imports and configured project references. Do not reinterpret compiler globs or filter program sources afterward. Excluded files imported by selected source are still program members, exactly as in TypeScript. Files outside every configured program are not checked; configuration and generated declarations inside a program must be classified like other source.",
  enforcement: { type: "architecture" },
});
export const compilerCheckingRule = defineRule({
  id: "compiler-checking", title: "Run the configured compiler without weakening its contract",
  description: "Validate effective compiler settings and strict-family overrides against enabled project requirements. noCheck is forbidden. Missing projects and invalid compiler configurations are errors, never silently skipped. The architecture runner uses compiler diagnostics without emitting application artifacts.",
  enforcement: { type: "architecture" },
});
export const reasonedSuppressionsRule = defineRule({
  id: "reasoned-suppressions", title: "Keep lint exceptions narrow and explained",
  description: "Use named-rule disable-line or disable-next-line comments with a nonempty -- reason. Do not use file-wide disables or inline rule reconfiguration to change architecture policy. Structural checks cannot be suppressed by lint comments. The runtime also reports unused directives as errors.",
  enforcement: { type: "architecture" },
});
