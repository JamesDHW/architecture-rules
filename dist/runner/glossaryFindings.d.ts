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
export declare const glossaryFindings: (architecture: Architecture, opened: Projects, files: readonly ClassifiedFile[], checked: readonly ClassifiedFile[], config: ConfigText) => Glossary;
export {};
//# sourceMappingURL=glossaryFindings.d.ts.map