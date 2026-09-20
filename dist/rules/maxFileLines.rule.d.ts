import type { Rule } from "eslint";
export type MaxFileLinesOptions = {
    readonly max: number;
    readonly skipBlankLines: boolean;
    readonly skipComments: boolean;
};
export declare const maxFileLinesWarnRule: {
    readonly id: "max-file-lines-warn";
    readonly options: import("../core/defineRule.js").RuleOptions<[Partial<MaxFileLinesOptions>?]>;
    readonly title: "Warn when a source file exceeds 150 lines";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: readonly ["warn", {
            readonly max: 150;
            readonly skipBlankLines: true;
            readonly skipComments: true;
        }];
        readonly implementation: Rule.RuleModule;
    };
};
export declare const maxFileLinesRule: {
    readonly id: "max-file-lines";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "max-lines";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, number | {
            readonly max?: number;
            readonly skipBlankLines?: boolean;
            readonly skipComments?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=maxFileLines.rule.d.ts.map