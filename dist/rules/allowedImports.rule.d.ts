import type { Rule } from "eslint";
export declare const allowedImportsRule: {
    readonly id: "allowed-imports";
    readonly title: "Respect architectural import permissions";
    readonly description: string;
    readonly instead: "Import only what this file type allows (architecture-check explain <file> lists it): move the code to a file type that may import it, or inject the dependency.";
    readonly suppressWhen: "A module is loaded by a path known only at runtime, such as a plugin named in configuration.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=allowedImports.rule.d.ts.map