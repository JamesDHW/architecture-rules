import type { Architecture } from "./types.js";
/** Layers ordered so each comes after the layers it imports, plus any import cycles between layers. */
export type LayerGraph = {
    readonly order: readonly string[];
    readonly cycles: readonly (readonly string[])[];
};
export declare const layerGraph: (architecture: Architecture) => LayerGraph;
//# sourceMappingURL=layerGraph.d.ts.map