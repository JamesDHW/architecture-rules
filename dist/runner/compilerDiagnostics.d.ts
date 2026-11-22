import type { Project } from "typescript/unstable/sync";
import type { Finding } from "./findings.js";
/** Every compiler error in the projects, as findings. */
export declare const compilerFindings: (root: string, projects: readonly Project[]) => readonly Finding[];
/**
 * The errors that belong to no one file: configuration, options and global ones. Global diagnostics check the whole
 * program, so a check with a cache asks for them only when something global changed.
 */
export declare const programFindings: (root: string, projects: readonly Project[]) => readonly Finding[];
/** The errors of source files: every file's, or only the named ones' (absolute paths). */
export declare const sourceFindings: (root: string, projects: readonly Project[], only?: ReadonlySet<string>) => readonly Finding[];
//# sourceMappingURL=compilerDiagnostics.d.ts.map