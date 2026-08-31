import type { Rule } from "eslint";
export declare const noDeepRelativeImportsRule: {
    readonly id: "no-deep-relative-imports";
    readonly title: "Warn on deeply ascending relative imports";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "warn";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noDeepRelativeImports.rule.d.ts.map