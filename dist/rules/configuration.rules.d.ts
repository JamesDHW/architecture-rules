export declare const unusedPermissionsRule: {
    readonly id: "unused-permissions";
    readonly title: "Grant only the dependencies a layer uses";
    readonly description: string;
    readonly instead: "Remove the grant from the layer's dependencies in architecture.config.ts.";
    readonly enforcement: {
        readonly type: "configuration";
        readonly configuration: "error";
    };
};
export declare const unmatchedPatternsRule: {
    readonly id: "unmatched-patterns";
    readonly title: "Select files with patterns that match";
    readonly description: string;
    readonly instead: "Fix or remove the pattern in architecture.config.ts.";
    readonly enforcement: {
        readonly type: "configuration";
        readonly configuration: "error";
    };
};
export declare const competingConfigurationRule: {
    readonly id: "competing-configuration";
    readonly title: "Keep one source of truth for checks";
    readonly description: string;
    readonly instead: "Move the settings you need into architecture.config.ts and delete the other configuration, or turn this rule off with a reason while you migrate.";
    readonly enforcement: {
        readonly type: "configuration";
        readonly configuration: "error";
    };
};
export declare const typescriptVersionRule: {
    readonly id: "typescript-version";
    readonly title: "Use the TypeScript version the checker uses";
    readonly description: string;
    readonly instead: "Set typescript in package.json to the checker's version, or remove it.";
    readonly enforcement: {
        readonly type: "configuration";
        readonly configuration: "error";
    };
};
//# sourceMappingURL=configuration.rules.d.ts.map