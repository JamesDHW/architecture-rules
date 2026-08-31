import type { Rule } from "eslint";
export declare const namedPredicatesRule: {
    readonly id: "named-predicates";
    readonly title: "Name your predicates";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=namedPredicates.rule.d.ts.map