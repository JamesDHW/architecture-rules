import { defineRule } from "../core/defineRule.js";
export const fileInventoryRule = defineRule({
    id: "file-inventory", title: "Account for compiler-selected source files",
    description: "Inventory only source files in the configured TypeScript programs. Do not scan unrelated repository files or require allowlists for documentation, assets, configuration or build outputs. Selected source must exist on disk; selected managed symlinks and root escapes are rejected. Dependency-install libraries are not application source.",
    enforcement: { type: "architecture" },
});
export const fileClassificationRule = defineRule({
    id: "file-classification", title: "Assign each source file exactly one layer",
    description: "Select by root-relative path patterns minus explicit per-layer exclusions. Zero or multiple matching layers are errors. Naming validates after selection and never changes membership. Project-wide settings are inherited policy, not another layer. Actual overlaps are checked on every run, not inferred by merging glob overrides.",
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
    id: "reasoned-suppressions", title: "Keep exceptions narrow and explained",
    description: "Make an exception for one line with `// architecture-disable-next-line <rule-id> -- <reason>` above it, or `// architecture-disable-line <rule-id> -- <reason>` at its end. Name architecture rule ids and give a nonempty reason. File-wide exceptions, exceptions without a reason and the underlying engines' own disable or configuration comments are rejected. Structural and compiler checks cannot be excepted. An exception that covers no finding is an error.",
    instead: "Fix the finding; if you can't, write `// architecture-disable-next-line <rule-id> -- <the concrete reason>` above the line.",
    evasions: [
        {
            name: "A reason that names no cost",
            code: "// architecture-disable-next-line no-let -- needed\nlet retryCount = 0;",
            why: "Any non-empty reason passes. Say concretely what complying would cost on this line, so a reviewer can judge it.",
        },
    ],
    enforcement: { type: "architecture" },
});
//# sourceMappingURL=architecture.rules.js.map