export declare const genericNameDenylistRule: {
    readonly id: "generic-name-denylist";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "id-denylist";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, ...string[]] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noShadowRule: {
    readonly id: "no-shadow";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-shadow";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allow?: readonly string[];
            readonly builtinGlobals?: boolean;
            readonly hoist?: "all" | "functions" | "functions-and-types" | "never" | "types";
            readonly ignoreFunctionTypeParameterNameValueShadow?: boolean;
            readonly ignoreOnInitialization?: boolean;
            readonly ignoreTypeValueShadow?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=naming.rules.d.ts.map