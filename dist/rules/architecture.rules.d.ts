export declare const fileInventoryRule: {
    readonly id: "file-inventory";
    readonly title: "Account for compiler-selected source files";
    readonly description: "Inventory only source files in the configured TypeScript programs. Do not scan unrelated repository files or require allowlists for documentation, assets, configuration or build outputs. Selected source must exist on disk; selected managed symlinks and root escapes are rejected. Dependency-install libraries are not application source.";
    readonly enforcement: {
        readonly type: "architecture";
    };
};
export declare const fileClassificationRule: {
    readonly id: "file-classification";
    readonly title: "Assign each source file exactly one layer";
    readonly description: "Select by root-relative path patterns minus explicit per-layer exclusions. Zero or multiple matching layers are errors. Naming validates after selection and never changes membership. Project-wide settings are inherited policy, not another layer. Actual overlaps are checked on every run, not inferred by merging glob overrides.";
    readonly enforcement: {
        readonly type: "architecture";
    };
};
export declare const projectMembershipRule: {
    readonly id: "project-membership";
    readonly title: "Govern all local TypeScript program sources";
    readonly description: "TypeScript owns scope through files, include, exclude, inherited configuration, allowJs, imports and configured project references. Do not reinterpret compiler globs or filter program sources afterward. Excluded files imported by selected source are still program members, exactly as in TypeScript. Files outside every configured program are not checked; configuration and generated declarations inside a program must be classified like other source.";
    readonly enforcement: {
        readonly type: "architecture";
    };
};
export declare const compilerCheckingRule: {
    readonly id: "compiler-checking";
    readonly title: "Run the configured compiler without weakening its contract";
    readonly description: "Validate effective compiler settings and strict-family overrides against enabled project requirements. noCheck is forbidden. Missing projects and invalid compiler configurations are errors, never silently skipped. The architecture runner uses compiler diagnostics without emitting application artifacts.";
    readonly enforcement: {
        readonly type: "architecture";
    };
};
export declare const reasonedSuppressionsRule: {
    readonly id: "reasoned-suppressions";
    readonly title: "Keep exceptions narrow and explained";
    readonly description: "Make an exception for one line with `// architecture-disable-next-line <rule-id> -- <reason>` above it, or `// architecture-disable-line <rule-id> -- <reason>` at its end. Name architecture rule ids and give a nonempty reason. File-wide exceptions, exceptions without a reason and the underlying engines' own disable or configuration comments are rejected. Structural and compiler checks cannot be excepted. An exception that covers no finding is an error.";
    readonly instead: "Fix the finding; if you can't, write `// architecture-disable-next-line <rule-id> -- <the concrete reason>` above the line.";
    readonly evasions: readonly [{
        readonly name: "A reason that names no cost";
        readonly code: "// architecture-disable-next-line no-let -- needed\nlet retryCount = 0;";
        readonly why: "Any non-empty reason passes. Say concretely what complying would cost on this line, so a reviewer can judge it.";
    }];
    readonly enforcement: {
        readonly type: "architecture";
    };
};
//# sourceMappingURL=architecture.rules.d.ts.map