import type { Rule } from "eslint";
export declare const controlFlowBracesRule: {
    readonly id: "control-flow-braces";
    readonly title: "Use braces except for single-line terminal guards";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=controlFlowBraces.rule.d.ts.map