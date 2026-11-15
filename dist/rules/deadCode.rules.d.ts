/** Names a check should accept without complaint, each for a reason given with the rule setting. */
export type AllowOptions = {
    readonly allow?: readonly string[];
};
export declare const unusedFilesRule: {
    readonly id: "unused-files";
    readonly title: "Delete files nothing uses";
    readonly description: string;
    readonly instead: "Delete the file, or, if something outside the program loads it, mark its layer as an entry with a reason.";
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "file";
        readonly configuration: "error";
    };
};
export declare const unusedExportsRule: {
    readonly id: "unused-exports";
    readonly title: "Export only what is imported";
    readonly description: string;
    readonly instead: "Remove the export keyword, or delete the value if nothing in its file uses it either.";
    readonly suppressWhen: "Something outside the program reads this one export, and the layer's entry exports cannot name it.";
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "file";
        readonly configuration: "error";
    };
};
export declare const unusedTypesRule: {
    readonly id: "unused-types";
    readonly title: "Export only types that are imported";
    readonly description: string;
    readonly instead: "Remove the export keyword from the type, or delete the type if its file does not use it either.";
    readonly suppressWhen: "The type is part of a public API that its layer's entry exports cannot name.";
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "file";
        readonly configuration: "error";
    };
};
export declare const duplicateExportsRule: {
    readonly id: "duplicate-exports";
    readonly title: "Export each value once";
    readonly description: string;
    readonly instead: "Keep one export name and update the importers of the other.";
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "file";
        readonly configuration: "error";
    };
};
export declare const productionReachabilityRule: {
    readonly id: "production-reachability";
    readonly title: "Ship only code production uses";
    readonly description: string;
    readonly instead: "Delete the code and its tests, move it into a development layer, or use it from production code.";
    readonly suppressWhen: "Production deliberately keeps this export for development use, such as a test seam the build strips.";
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "file";
        readonly configuration: "error";
    };
};
export declare const unusedDependenciesRule: {
    readonly id: "unused-dependencies";
    readonly title: "Declare only packages that are used";
    readonly description: string;
    readonly instead: "Remove the package from package.json, or allow it by name with a reason: \"unused-dependencies\": { options: { allow: [\"sharp\"] }, reason: \"…\" }.";
    readonly options: import("../core/defineRule.js").RuleOptions<[AllowOptions?]>;
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "project";
        readonly configuration: "error";
    };
};
export declare const unlistedDependenciesRule: {
    readonly id: "unlisted-dependencies";
    readonly title: "Declare every package that is used";
    readonly description: string;
    readonly instead: "Add the package to package.json: to dependencies when a production layer imports it.";
    readonly options: import("../core/defineRule.js").RuleOptions<[AllowOptions?]>;
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "project";
        readonly configuration: "error";
    };
};
export declare const unlistedBinariesRule: {
    readonly id: "unlisted-binaries";
    readonly title: "Declare every command the scripts run";
    readonly description: string;
    readonly instead: "Add the package that provides the command, or allow a system command by name with a reason.";
    readonly options: import("../core/defineRule.js").RuleOptions<[AllowOptions?]>;
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "project";
        readonly configuration: "error";
    };
};
export declare const unresolvedImportsRule: {
    readonly id: "unresolved-imports";
    readonly title: "Resolve every import the same way everywhere";
    readonly description: string;
    readonly instead: "Use an import TypeScript and the bundler resolve the same way, such as a tsconfig paths alias, or report the specifier as a bug.";
    readonly enforcement: {
        readonly type: "dead-code";
        readonly scope: "file";
        readonly configuration: "error";
    };
};
//# sourceMappingURL=deadCode.rules.d.ts.map