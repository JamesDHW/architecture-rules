import { defineRule } from "../core/defineRule.js";

export const fileInventoryRule = defineRule({
  id: "file-inventory", title: "Account for every project file",
  description: "Scan the architecture root independently of gitignore. Permit only governed source, explicit auxiliary/tooling paths, and reasoned generated exclusions. Managed symlinks are rejected to avoid ambiguous identity and root escapes. Git metadata and dependency-install directories are infrastructure, not application code.",
  enforcement: { type: "architecture" },
});
export const fileClassificationRule = defineRule({
  id: "file-classification", title: "Assign each source file exactly one architectural type",
  description: "Select by root-relative path patterns minus explicit per-type exclusions. Zero or multiple matching types are errors. Naming validates after selection and never changes membership. Defaults are inherited policy, not another file type. Actual overlaps are checked on every run, not inferred by merging glob overrides.",
  enforcement: { type: "architecture" },
});
export const projectMembershipRule = defineRule({
  id: "project-membership", title: "Govern all local TypeScript program sources",
  description: "Resolve configured TypeScript programs and their local import-reachable sources. Code outside all configured programs must be assigned to a compiler project, not hidden by miscellaneous-file globs. Tooling exceptions are exact paths outside application programs. Generated exclusions cannot hide program source.",
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
