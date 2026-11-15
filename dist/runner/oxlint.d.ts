import type { Project } from "typescript/unstable/sync";
import type { ImportIssue } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { type Finding } from "./findings.js";
/**
 * Lints the files through a generated config in a private directory inside the root, where the
 * engine's relative globs resolve. The directory is created after inventory and always removed.
 */
export declare const lint: (root: string, files: readonly ClassifiedFile[], imports: readonly ImportIssue[], projects: readonly Project[], fix: boolean) => Promise<readonly Finding[] | ArchitectureError>;
//# sourceMappingURL=oxlint.d.ts.map