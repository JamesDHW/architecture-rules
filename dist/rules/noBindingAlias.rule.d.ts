import type { Rule } from "eslint";
export declare const noBindingAliasRule: {
    readonly id: "no-binding-alias";
    readonly title: "Do not rename values through aliases";
    readonly description: string;
    readonly instead: "Use the original name, or compute a genuinely new value; import names as they are exported.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noBindingAlias.rule.d.ts.map