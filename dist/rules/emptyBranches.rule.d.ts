import type { Rule } from "eslint";
export declare const emptyBranchesRule: {
    readonly id: "no-empty-branches";
    readonly title: "Remove empty conditional branches";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=emptyBranches.rule.d.ts.map