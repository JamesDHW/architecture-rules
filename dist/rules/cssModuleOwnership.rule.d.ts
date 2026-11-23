import type { Rule } from "eslint";
export declare const cssModuleOwnershipRule: {
    readonly id: "css-module-ownership";
    readonly title: "Import a CSS module only from its own component";
    readonly description: string;
    readonly instead: "Import X.module.css only from X.tsx; share styles by rendering a component, or give this file its own module.";
    readonly suppressWhen: "A stylesheet is shared on purpose, such as one layout module used by every page of a route group.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=cssModuleOwnership.rule.d.ts.map