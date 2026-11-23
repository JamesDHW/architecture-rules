import type { Project } from "typescript/unstable/sync";
import type { Architecture } from "../../config/types.js";
import type { ConfigText } from "../configurationChecks.js";
import type { ClassifiedFile, Issue } from "../inventory.js";
import { type NameIssue } from "./nameIssues.js";
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
/** The configuration, every classified file, the TypeScript projects, and which files' names to report. */
export type GlossaryScope = {
    readonly architecture: Architecture;
    readonly files: readonly ClassifiedFile[];
    readonly projects: readonly Project[];
    readonly config: ConfigText;
    readonly checked: ReadonlySet<string>;
};
export declare const checkGlossaries: ({ architecture, files, projects, config, checked }: GlossaryScope) => GlossaryResult;
//# sourceMappingURL=check.d.ts.map