import type { Rule } from "eslint";
export type Severity = "off" | "warn" | "error";
export type OxlintRuleConfiguration = Severity | readonly [Severity, ...(readonly unknown[])];
type OxlintEnforcement = {
    readonly type: "oxlint";
    readonly rule: string;
    readonly configuration: OxlintRuleConfiguration;
};
type CustomOxlintEnforcement = {
    readonly type: "custom-oxlint";
    readonly configuration: OxlintRuleConfiguration;
    readonly implementation: Rule.RuleModule;
};
type TypeScriptEnforcement = {
    readonly type: "typescript";
    readonly compilerOptions: Readonly<Record<string, unknown>>;
};
type AdvisoryEnforcement = {
    readonly type: "advisory";
};
export type Enforcement = OxlintEnforcement | CustomOxlintEnforcement | TypeScriptEnforcement | AdvisoryEnforcement;
export type ArchitectureRule<Id extends string = string> = {
    readonly id: Id;
    readonly title: string;
    /**
     * This is the canonical documentation for the rule.
     *
     * Do not maintain a separate prose version elsewhere.
     */
    readonly description: string;
    readonly enforcement: Enforcement;
};
export declare const defineRule: <const RuleDefinition extends ArchitectureRule>(rule: RuleDefinition) => RuleDefinition;
export {};
//# sourceMappingURL=defineRule.d.ts.map