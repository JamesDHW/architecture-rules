import type { Rule } from "eslint";
export declare const groupedLogicalOperatorsRule: {
    readonly id: "grouped-logical-operators";
    readonly title: "Expose mixed logical operator precedence";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=groupedLogicalOperators.rule.d.ts.map