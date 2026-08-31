import type { Rule } from "eslint";
export declare const namedJsxHandlersRule: {
    readonly id: "named-jsx-handlers";
    readonly title: "Name every non-pass-through React handler";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=namedJsxHandlers.rule.d.ts.map