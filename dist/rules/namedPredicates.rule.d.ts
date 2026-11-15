import type { Rule } from "eslint";
export type NamedPredicatesOptions = {
    readonly nullishGuards?: readonly string[];
    readonly presenceGuards?: readonly string[];
};
export declare const namedPredicatesRule: {
    readonly id: "named-predicates";
    readonly options: import("../core/defineRule.js").RuleOptions<[NamedPredicatesOptions?]>;
    readonly title: "Name your predicates";
    readonly description: string;
    readonly instead: "Name the compound condition and test the name: const canEdit = isOwner || isAdmin;";
    readonly evasions: readonly [{
        readonly name: "A name that says nothing";
        readonly code: "const openProject = () => {\n  const condition = isOwner || isAdministrator;\n  if (condition) return showEditor();\n  return showViewer();\n};";
        readonly why: "The rule asks for the decision to be named; condition, check and flag name nothing. Name what is true: const canEditProject = isOwner || isAdministrator;";
    }];
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=namedPredicates.rule.d.ts.map