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
    readonly title: "Assign each source file exactly one architectural type";
    readonly description: "Select by root-relative path patterns minus explicit per-type exclusions. Zero or multiple matching types are errors. Naming validates after selection and never changes membership. Defaults are inherited policy, not another file type. Actual overlaps are checked on every run, not inferred by merging glob overrides.";
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
    readonly title: "Keep lint exceptions narrow and explained";
    readonly description: "Use named-rule disable-line or disable-next-line comments with a nonempty -- reason. Do not use file-wide disables or inline rule reconfiguration to change architecture policy. Structural checks cannot be suppressed by lint comments. The runtime also reports unused directives as errors.";
    readonly enforcement: {
        readonly type: "architecture";
    };
};
//# sourceMappingURL=architecture.rules.d.ts.map