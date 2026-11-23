import type { ConfigText } from "../analysis/configurationChecks.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import type { Architecture } from "../config/types.js";
import type { Finding } from "./findings.js";
type Glossary = {
    readonly names: readonly Finding[];
    readonly configuration: readonly Finding[];
};
/**
 * Glossary findings: about names in the checked files, at the severity their layer gives each rule, and about the
 * glossaries in the configuration, at the project-wide severity.
 */
type Scope = {
    readonly architecture: Architecture;
    readonly opened: Projects;
    readonly files: readonly ClassifiedFile[];
    /** The files whose names to check now; the rest have cached findings or are outside the selection. */
    readonly checked: readonly ClassifiedFile[];
    readonly config: ConfigText;
};
export declare const glossaryFindings: ({ architecture, opened, files, checked, config }: Scope) => Glossary;
export {};
//# sourceMappingURL=glossaryFindings.d.ts.map