import type { Rule } from "eslint";
export declare const onePathOneResultRule: {
    readonly id: "one-path-one-result";
    readonly title: "One path should produce one result";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "warn";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=onePathOneResult.rule.d.ts.map