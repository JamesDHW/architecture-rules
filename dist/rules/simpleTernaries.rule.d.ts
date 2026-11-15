import type { Rule } from "eslint";
export declare const simpleTernariesRule: {
    readonly id: "simple-ternaries";
    readonly title: "Keep ternaries simple and side-effect-free";
    readonly description: string;
    readonly instead: "Use an if with return, or a named function, instead of a nested or effectful ternary.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=simpleTernaries.rule.d.ts.map