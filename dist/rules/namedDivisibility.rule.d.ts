import type { Rule } from "eslint";
export declare const namedDivisibilityRule: {
    readonly id: "named-divisibility";
    readonly title: "Name divisibility checks";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=namedDivisibility.rule.d.ts.map