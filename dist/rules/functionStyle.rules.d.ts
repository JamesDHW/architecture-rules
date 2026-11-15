export declare const preferArrowFunctionsRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "prefer-arrow-functions";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "func-style";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "declaration" | "expression"] | readonly [import("../core/defineRule.js").Severity, "declaration" | "expression", {
            readonly allowArrowFunctions?: boolean;
            readonly allowTypeAnnotation?: boolean;
            readonly overrides?: {
                readonly namedExports?: "declaration" | "expression" | "ignore";
            };
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const preferArrowCallbackRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "prefer-arrow-callback";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "prefer-arrow-callback";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowNamedFunctions?: boolean;
            readonly allowUnboundThis?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=functionStyle.rules.d.ts.map