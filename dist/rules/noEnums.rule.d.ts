import type { Rule } from "eslint";
export declare const noEnumsRule: {
    readonly id: "no-enums";
    readonly title: "Use literal unions instead of enums";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noEnums.rule.d.ts.map