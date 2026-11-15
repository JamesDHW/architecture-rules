import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import type { Finding } from "./findings.js";
export type DeadCodeScope = {
    readonly architecture: Architecture;
    readonly files: readonly ClassifiedFile[];
    readonly projects: readonly Project[];
    readonly configFile: string;
};
/**
 * Finds unused files, exports and dependencies from the layers' entries, through a generated configuration in a
 * private directory inside the root. Exports count as used only when imported, or public through an entry.
 */
export declare const deadCode: (root: string, { architecture, files, projects, configFile }: DeadCodeScope) => Promise<readonly Finding[] | ArchitectureError>;
//# sourceMappingURL=deadCode.d.ts.map