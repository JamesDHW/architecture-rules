import type { Rule } from "eslint";
export declare const domainOwnedDispatchRule: {
    readonly id: "domain-owned-dispatch";
    readonly title: "Dispatch domain actions through their owning reducer";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=domainOwnedDispatch.rule.d.ts.map