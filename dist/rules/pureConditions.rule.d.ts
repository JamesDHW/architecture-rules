import type { Rule } from "eslint";
export declare const pureConditionsRule: {
    readonly id: "pure-conditions";
    readonly title: "Keep conditions free of explicit effects";
    readonly description: string;
    readonly instead: "Compute the effect into a const first, then test the const.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=pureConditions.rule.d.ts.map