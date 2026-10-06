import type { Rule } from "eslint";
export declare const noArrayMutationRule: {
    readonly id: "no-array-mutation";
    readonly title: "Build new arrays instead of changing them in place";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noArrayMutation.rule.d.ts.map