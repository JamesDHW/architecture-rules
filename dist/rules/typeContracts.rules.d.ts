export declare const explicitExportedReturnTypesRule: {
    readonly id: "explicit-exported-return-types";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/explicit-module-boundary-types";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowArgumentsExplicitlyTypedAsAny?: boolean;
            readonly allowDirectConstAssertionInArrowFunctions?: boolean;
            readonly allowHigherOrderFunctions?: boolean;
            readonly allowOverloadFunctions?: boolean;
            readonly allowTypedFunctionExpressions?: boolean;
            readonly allowedNames?: readonly string[];
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const typeAliasesRule: {
    readonly id: "type-aliases";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/consistent-type-definitions";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "interface" | "type"] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const switchExhaustivenessRule: {
    readonly id: "switch-exhaustiveness";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/switch-exhaustiveness-check";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowDefaultCaseForExhaustiveSwitch?: boolean;
            readonly considerDefaultExhaustiveForUnions?: boolean;
            readonly defaultCaseCommentPattern?: string;
            readonly requireDefaultForNonUnion?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=typeContracts.rules.d.ts.map