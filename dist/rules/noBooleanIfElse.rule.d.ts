import type { Rule } from "eslint";
export declare const noBooleanIfElseRule: {
    readonly id: "no-boolean-if-else";
    readonly title: "Pass booleans directly instead of branching";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noBooleanIfElse.rule.d.ts.map