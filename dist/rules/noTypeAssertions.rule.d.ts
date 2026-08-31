import type { Rule } from "eslint";
export declare const noTypeAssertionsRule: {
    readonly id: "no-type-assertions";
    readonly title: "Do not use unchecked type assertions";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noTypeAssertions.rule.d.ts.map