import type { Rule } from "eslint";
export declare const noLetRule: {
    readonly id: "no-let";
    readonly title: "Declare every binding with const";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noLet.rule.d.ts.map