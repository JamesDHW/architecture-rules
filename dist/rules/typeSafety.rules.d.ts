export declare const noExplicitAnyRule: {
    readonly id: "no-explicit-any";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-explicit-any";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly fixToUnknown?: boolean;
            readonly ignoreRestArgs?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noNonNullAssertionRule: {
    readonly id: "no-non-null-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-non-null-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noTsCommentsRule: {
    readonly id: "no-ts-comments";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/ban-ts-comment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly minimumDescriptionLength?: number;
            readonly "ts-check"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
            readonly "ts-expect-error"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
            readonly "ts-ignore"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
            readonly "ts-nocheck"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeAssignmentRule: {
    readonly id: "no-unsafe-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-assignment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeCallRule: {
    readonly id: "no-unsafe-call";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-call";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeMemberAccessRule: {
    readonly id: "no-unsafe-member-access";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-member-access";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowOptionalChaining?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeReturnRule: {
    readonly id: "no-unsafe-return";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-return";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeArgumentRule: {
    readonly id: "no-unsafe-argument";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-argument";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeTypeAssertionRule: {
    readonly id: "no-unsafe-type-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-type-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=typeSafety.rules.d.ts.map