import type { Rule } from "eslint";
export declare const noCapturedMutationRule: {
    readonly id: "no-captured-mutation";
    readonly title: "Keep long-lived state in *.state.ts modules";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noCapturedMutation.rule.d.ts.map