import { type ConfigText } from "../analysis/configurationChecks.js";
import type { ImportUse } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import type { Architecture } from "../config/types.js";
import { type Finding } from "./findings.js";
/** The architecture configuration, read so findings about it can point at their line. */
export declare const readConfig: (root: string, configFile: string | undefined) => ConfigText;
type Scope = {
    readonly architecture: Architecture;
    readonly files: readonly ClassifiedFile[];
    readonly config: ConfigText;
};
/** Checks of the configuration and project setup, at the severity architecture.config.ts gives each rule. */
export declare const configurationFindings: (root: string, opened: Projects, scope: Scope, uses: readonly ImportUse[]) => readonly Finding[];
export {};
//# sourceMappingURL=configurationFindings.d.ts.map