import type { Rule } from "eslint";
export declare const noCollapsibleIfRule: {
    readonly id: "no-collapsible-if";
    readonly title: "Do not nest a sole if inside another if";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noCollapsibleIf.rule.d.ts.map