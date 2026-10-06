import type { Rule } from "eslint";
export declare const noEnumsRule: {
    readonly id: "no-enums";
    readonly title: "Use literal unions instead of enums";
    readonly description: string;
    readonly instead: "Use a union of string literals instead of an enum.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noEnums.rule.d.ts.map