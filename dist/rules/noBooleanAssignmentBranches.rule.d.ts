import type { Rule } from "eslint";
export declare const noBooleanAssignmentBranchesRule: {
    readonly id: "no-boolean-assignment-branches";
    readonly title: "Do not assign boolean literals in branches";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noBooleanAssignmentBranches.rule.d.ts.map