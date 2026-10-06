import type { Rule } from "eslint";
export declare const noFinallyRule: {
    readonly id: "no-finally";
    readonly title: "Sequence normalized operations and cleanup without finally";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noFinally.rule.d.ts.map