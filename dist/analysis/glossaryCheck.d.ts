import type { Project } from "typescript/unstable/sync";
import type { Architecture } from "../config/types.js";
import type { ConfigText } from "./configurationChecks.js";
import type { ClassifiedFile, Issue } from "./inventory.js";
/** An issue about one name: where the name is declared, to the column. */
export type NameIssue = Issue & {
    readonly column?: number;
};
/** Issues about the names in the checked files, and about the glossaries themselves. */
export type GlossaryResult = {
    readonly names: readonly NameIssue[];
    readonly configuration: readonly Issue[];
};
/**
 * The glossary checks. Every file that follows a glossary is read, since a term's type and a term's use can be
 * anywhere in its layers; names are checked only in the checked files, and types are asked only for names that use
 * a glossary's words.
 */
export declare const checkGlossaries: (architecture: Architecture, files: readonly ClassifiedFile[], projects: readonly Project[], config: ConfigText, checked: ReadonlySet<string>) => GlossaryResult;
//# sourceMappingURL=glossaryCheck.d.ts.map