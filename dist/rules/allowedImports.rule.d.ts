import type { Rule } from "eslint";
export declare const allowedImportsRule: {
    readonly id: "allowed-imports";
    readonly title: "Respect architectural import permissions";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=allowedImports.rule.d.ts.map