export declare const asyncAwaitRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "async-await";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "promise/prefer-await-to-then";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly strict?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noFloatingPromisesRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-floating-promises";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-floating-promises";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowForKnownSafeCalls?: readonly (string | {
                readonly from: "file";
                readonly name: string | readonly string[];
                readonly path?: string;
            } | {
                readonly from: "lib";
                readonly name: string | readonly string[];
            } | {
                readonly from: "package";
                readonly name: string | readonly string[];
                readonly package: string;
            })[];
            readonly allowForKnownSafePromises?: readonly (string | {
                readonly from: "file";
                readonly name: string | readonly string[];
                readonly path?: string;
            } | {
                readonly from: "lib";
                readonly name: string | readonly string[];
            } | {
                readonly from: "package";
                readonly name: string | readonly string[];
                readonly package: string;
            })[];
            readonly checkThenables?: boolean;
            readonly ignoreIIFE?: boolean;
            readonly ignoreVoid?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noMisusedPromisesRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-misused-promises";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-misused-promises";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly checksConditionals?: boolean;
            readonly checksSpreads?: boolean;
            readonly checksVoidReturn?: boolean | {
                readonly arguments?: boolean;
                readonly attributes?: boolean;
                readonly inheritedMethods?: boolean;
                readonly properties?: boolean;
                readonly returns?: boolean;
                readonly variables?: boolean;
            };
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const awaitThenableRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "await-thenable";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/await-thenable";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noAwaitInLoopRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-await-in-loop";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-await-in-loop";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=asyncFlow.rules.d.ts.map