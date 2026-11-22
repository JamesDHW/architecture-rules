import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";
/** The governed file and layer a denied import reached, when it reached one. */
type ImportTarget = {
    readonly layer: string;
    readonly file: string;
};
export type ImportIssue = Issue & {
    readonly line: number;
    readonly column: number;
    readonly target?: ImportTarget;
};
/** A permission an import relied on: a layer, an external specifier (built-ins with node:) or an asset path. */
export type ImportUse = {
    readonly layer: string;
    readonly kind: "internal" | "external" | "asset";
    readonly value: string;
};
/** An allowed import of one governed file by another, both root-relative. */
export type ImportLink = {
    readonly from: string;
    readonly to: string;
};
/** Every import problem, every permission that some import used, and every allowed import between governed files. */
export type ImportAnalysis = {
    readonly issues: readonly ImportIssue[];
    readonly uses: readonly ImportUse[];
    readonly links: readonly ImportLink[];
};
/** Checks every import against its layer's dependencies, and records the permissions the allowed ones used. */
export declare const analyzeImports: (root: string, files: readonly ClassifiedFile[], projects: readonly Project[]) => ImportAnalysis;
export {};
//# sourceMappingURL=imports.d.ts.map