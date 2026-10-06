import type { Rule } from "eslint";
export declare const noRawExceptionsRule: {
    readonly id: "no-raw-exceptions";
    readonly title: "Confine raw exceptions to explicit adapters";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noRawExceptions.rule.d.ts.map