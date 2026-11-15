import type { Rule } from "eslint";
export declare const noElseRule: {
    readonly id: "no-else";
    readonly title: "Do not use else";
    readonly description: string;
    readonly instead: "Return early for the special case and let the main path continue without else.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noElse.rule.d.ts.map