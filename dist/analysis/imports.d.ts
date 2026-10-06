import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";
export type ImportIssue = Issue & {
    readonly line: number;
    readonly column: number;
};
export declare const checkImports: (root: string, files: readonly ClassifiedFile[], projects: readonly Project[]) => readonly ImportIssue[];
//# sourceMappingURL=imports.d.ts.map