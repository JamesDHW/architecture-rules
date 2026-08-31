import type { Rule } from "eslint";
export declare const readonlyTypePropertiesRule: {
    readonly id: "readonly-type-properties";
    readonly title: "Declare data as recursively readonly";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=readonlyTypeProperties.rule.d.ts.map