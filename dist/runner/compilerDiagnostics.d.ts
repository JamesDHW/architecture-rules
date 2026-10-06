import type { Project } from "typescript/unstable/sync";
import type { Finding } from "./findings.js";
/** Every compiler error in the projects, as findings. */
export declare const compilerFindings: (root: string, projects: readonly Project[]) => readonly Finding[];
//# sourceMappingURL=compilerDiagnostics.d.ts.map