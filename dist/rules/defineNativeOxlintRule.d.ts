import type { OxlintRuleConfiguration } from "../core/defineRule.js";
export declare const defineNativeOxlintRule: <const Id extends string>(rule: {
    readonly id: Id;
    readonly title: string;
    readonly description: string;
    readonly rule: string;
    readonly configuration: OxlintRuleConfiguration;
}) => {
    readonly id: Id;
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=defineNativeOxlintRule.d.ts.map