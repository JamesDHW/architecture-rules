import type { Rule } from "eslint";
export declare const destructuredPropsRule: {
    readonly id: "destructured-props";
    readonly title: "Destructure component props in the parameter list";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=destructuredProps.rule.d.ts.map