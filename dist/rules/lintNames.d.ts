import type { ArchitectureRule } from "../core/defineRule.js";
/** The name the Oxlint config and suppression comments use for a lint rule, such as architecture/no-let; undefined when the rule is not a lint rule. */
export declare const lintRuleName: (rule: ArchitectureRule) => string | undefined;
/**
 * Every name the engine may use for a lint rule: its configured name, and for React's hook rules the react-hooks
 * name the engine reports them and their disable comments under.
 */
export declare const lintNameAliases: (lintName: string) => readonly string[];
/** How Oxlint labels a lint rule's findings: architecture/no-let becomes architecture(no-let). */
export declare const diagnosticCode: (lintName: string) => string;
/** Lint, dead-code and program rules can be excepted on a line; structural, configuration and compiler checks always apply. */
export declare const isExceptable: (rule: ArchitectureRule) => boolean;
//# sourceMappingURL=lintNames.d.ts.map