export declare const explicitJsxPropsRule: {
    readonly id: "explicit-jsx-props";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/jsx-props-no-spreading";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly custom?: "enforce" | "ignore";
            readonly exceptions?: readonly string[];
            readonly explicitSpread?: "enforce" | "ignore";
            readonly html?: "enforce" | "ignore";
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const moduleScopeComponentsRule: {
    readonly id: "module-scope-components";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/no-unstable-nested-components";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowAsProps?: boolean;
            readonly customValidators?: readonly string[];
            readonly propNamePattern?: string;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const rulesOfHooksRule: {
    readonly id: "rules-of-hooks";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/rules-of-hooks";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const exhaustiveDepsRule: {
    readonly id: "exhaustive-deps";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/exhaustive-deps";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly additionalHooks?: string;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const jsxKeyRule: {
    readonly id: "jsx-key";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/jsx-key";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly checkFragmentShorthand?: boolean;
            readonly checkKeyMustBeforeSpread?: boolean;
            readonly warnOnDuplicates?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=react.rules.d.ts.map