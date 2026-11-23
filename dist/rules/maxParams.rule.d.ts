export declare const maxParamsRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "max-params";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "max-params";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, number | {
            readonly countThis?: "always" | "except-void" | "never";
            readonly countVoidThis?: boolean;
            readonly max?: number;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=maxParams.rule.d.ts.map