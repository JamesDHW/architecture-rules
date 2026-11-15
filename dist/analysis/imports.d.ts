import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";
export type ImportIssue = Issue & {
    readonly line: number;
    readonly column: number;
};
/** A permission an import relied on: a layer, an external specifier (built-ins with node:) or an asset path. */
export type ImportUse = {
    readonly layer: string;
    readonly kind: "internal" | "external" | "asset";
    readonly value: string;
};
/** Every import problem, and every permission that some import used. */
export type ImportAnalysis = {
    readonly issues: readonly ImportIssue[];
    readonly uses: readonly ImportUse[];
};
/** Checks every import against its layer's dependencies, and records the permissions the allowed ones used. */
export declare const analyzeImports: (root: string, files: readonly ClassifiedFile[], projects: readonly Project[]) => ImportAnalysis;
//# sourceMappingURL=imports.d.ts.map