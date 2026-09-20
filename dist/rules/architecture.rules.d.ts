export declare const fileInventoryRule: {
    readonly id: "file-inventory";
    readonly title: "Account for every project file";
    readonly description: "Scan the architecture root independently of gitignore. Permit only governed source, explicit auxiliary/tooling paths, and reasoned generated exclusions. Managed symlinks are rejected to avoid ambiguous identity and root escapes. Git metadata and dependency-install directories are infrastructure, not application code.";
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
    readonly description: "Resolve configured TypeScript programs and their local import-reachable sources. Code outside all configured programs must be assigned to a compiler project, not hidden by miscellaneous-file globs. Tooling exceptions are exact paths outside application programs. Generated exclusions cannot hide program source.";
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