export declare const namedExportsRule: {
    readonly id: "named-exports";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "import/no-default-export";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noCycleRule: {
    readonly id: "no-cycle";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "import/no-cycle";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowUnsafeDynamicCyclicDependency?: boolean;
            readonly ignoreExternal?: boolean;
            readonly ignoreTypes?: boolean;
            readonly maxDepth?: number;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=modules.rules.d.ts.map