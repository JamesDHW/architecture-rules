import type { Architecture } from "../config/types.js";
import type { CheckResult } from "../runner/checkResult.js";
import type { Finding } from "../runner/findings.js";
export declare const unknownLayers: (architecture: Architecture, layers: readonly string[]) => readonly string[];
/**
 * The findings the layers own: those in their files. With incoming, instead the denied imports from other layers'
 * files into these layers: who reaches in.
 */
export declare const layerFindings: (result: CheckResult, layers: readonly string[], incoming: boolean) => readonly Finding[];
//# sourceMappingURL=layerScope.d.ts.map