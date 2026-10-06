export declare const guardClausesRule: {
    readonly id: "guard-clauses";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-else-return";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowElseIf?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const nullishDefaultsRule: {
    readonly id: "nullish-defaults";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/prefer-nullish-coalescing";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly ignoreBooleanCoercion?: boolean;
            readonly ignoreConditionalTests?: boolean;
            readonly ignoreIfStatements?: boolean;
            readonly ignoreMixedLogicalExpressions?: boolean;
            readonly ignorePrimitives?: boolean | {
                readonly bigint?: boolean;
                readonly boolean?: boolean;
                readonly number?: boolean;
                readonly string?: boolean;
            };
            readonly ignoreTernaryTests?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const eqeqeqRule: {
    readonly id: "eqeqeq";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "eqeqeq";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "always" | "smart"] | readonly [import("../core/defineRule.js").Severity, "always" | "smart", {
            readonly null?: "always" | "ignore" | "never";
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noBooleanCastRule: {
    readonly id: "no-boolean-cast";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-implicit-coercion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allow?: readonly string[];
            readonly boolean?: boolean;
            readonly disallowTemplateShorthand?: boolean;
            readonly number?: boolean;
            readonly string?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnneededTernaryRule: {
    readonly id: "no-unneeded-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-unneeded-ternary";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly defaultAssignment?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const preferLogicalOverTernaryRule: {
    readonly id: "prefer-logical-over-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/prefer-logical-operator-over-ternary";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=conditions.rules.d.ts.map