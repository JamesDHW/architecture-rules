import type { ArchitectureRule } from "../core/defineRule.js";
/** What fixes a rule's findings without a person: `--fix` for lint fixes, or a command. */
type Autofix = {
    readonly lintFix: boolean;
    readonly command?: string;
};
/** One rule in the catalogue: what it checks and how to deal with its findings. */
export type CatalogueEntry = {
    readonly id: string;
    readonly title: string;
    readonly kind: string;
    readonly default: unknown;
    readonly description: string;
    readonly instead?: string;
    readonly exceptionWhen?: string;
    readonly autofix: Autofix;
    readonly docs: string;
};
export declare const catalogueEntry: (rule: ArchitectureRule) => CatalogueEntry;
export declare const ruleById: (id: string) => ArchitectureRule | undefined;
/** Every rule, for an adoption agent mapping another linter's rules onto these. */
export declare const catalogue: () => readonly CatalogueEntry[];
export {};
//# sourceMappingURL=ruleCatalogue.d.ts.map