import type { Rule } from "eslint";
export declare const preferSingleBooleanReturnRule: {
    readonly id: "prefer-single-boolean-return";
    readonly title: "Return a boolean expression instead of a true/false tail";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=preferSingleBooleanReturn.rule.d.ts.map