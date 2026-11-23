import type { Rule } from "eslint";
import { type MaxFunctionLinesOptions } from "./maxFunctionLines.constants.js";
export type { MaxFunctionLinesOptions } from "./maxFunctionLines.constants.js";
export declare const maxFunctionLinesWarnRule: {
    readonly id: "max-function-lines-warn";
    readonly options: import("../core/defineRule.js").RuleOptions<[Partial<MaxFunctionLinesOptions>?]>;
    readonly title: "Warn when a function is longer than 40 lines";
    readonly description: string;
    readonly instead: "Extract named steps into their own functions, so this one either coordinates them or carries out one.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: readonly ["warn", {
            readonly max: 40;
            readonly skipBlankLines: true;
            readonly skipComments: true;
        }];
        readonly implementation: Rule.RuleModule;
    };
};
export declare const maxFunctionLinesRule: {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "max-function-lines";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "max-lines-per-function";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, number | {
            readonly IIFEs?: boolean;
            readonly max?: number;
            readonly skipBlankLines?: boolean;
            readonly skipComments?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=maxFunctionLines.rule.d.ts.map