import type { Rule } from "eslint";
export declare const simpleTernariesRule: {
    readonly id: "simple-ternaries";
    readonly title: "Keep ternaries simple and side-effect-free";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=simpleTernaries.rule.d.ts.map