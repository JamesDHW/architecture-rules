import type { Rule } from "eslint";
export declare const constantsModuleRule: {
    readonly id: "constants-module";
    readonly title: "Put semantic constants in a constants module";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=constantsModule.rule.d.ts.map