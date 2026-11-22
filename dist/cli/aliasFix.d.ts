import { ArchitectureError } from "../errors/architectureError.js";
import type { Finding } from "../runner/findings.js";
import type { ProjectAliases } from "../runner/projectAliases.js";
/** Rewrites deep relative imports through the projects' path aliases. Returns how many changed and how many had no alias. */
export declare const applyAliases: (root: string, findings: readonly Finding[], aliases: readonly ProjectAliases[]) => {
    readonly changed: number;
    readonly unchanged: number;
} | ArchitectureError;
//# sourceMappingURL=aliasFix.d.ts.map