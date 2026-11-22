import type { CheckResult } from "../runner/checkResult.js";
/** An edge's state: an allowed dependency some import uses, one nothing uses, or imports the rules deny. */
type EdgeState = "used" | "unused" | "violating";
export type GraphNode = {
    readonly id: string;
    readonly label: string;
    readonly kind: "layer" | "directory";
    readonly files: number;
};
export type GraphEdge = {
    readonly from: string;
    readonly to: string;
    readonly state: EdgeState;
    readonly count?: number;
};
/** The architecture as the rules declare it, overlaid with what the code imports. */
export type ArchitectureGraph = {
    readonly version: 1;
    readonly layer?: string;
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly GraphEdge[];
};
/** The architecture graph: layers, or one layer expanded into its directories. */
export declare const architectureGraph: (result: CheckResult, layer: string | undefined) => ArchitectureGraph;
export {};
//# sourceMappingURL=architectureGraph.d.ts.map