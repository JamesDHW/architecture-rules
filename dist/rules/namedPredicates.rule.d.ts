import type { Rule } from "eslint";
export type NamedPredicatesOptions = {
    readonly nullishGuards?: readonly string[];
    readonly presenceGuards?: readonly string[];
};
export declare const namedPredicatesRule: {
    readonly id: "named-predicates";
    readonly options: import("../core/defineRule.js").RuleOptions<[NamedPredicatesOptions?]>;
    readonly title: "Name your predicates";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=namedPredicates.rule.d.ts.map