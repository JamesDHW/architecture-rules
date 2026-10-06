import type { Rule } from "eslint";
export declare const controlFlowBracesRule: {
    readonly id: "control-flow-braces";
    readonly title: "Use braces except for single-line terminal guards";
    readonly description: string;
    readonly instead: "Add braces around the body; only a single-line terminal guard such as `if (isDone) return result;` may omit them.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=controlFlowBraces.rule.d.ts.map