import type { ArchitectureGraph } from "./architectureGraph.js";
import type { GraphFormat } from "./cliArgs.js";
/** A Mermaid flowchart: denied imports in red, unused allowances dashed. GitHub and GitLab render it in Markdown. */
export declare const renderMermaid: (graph: ArchitectureGraph) => string;
export declare const renderGraph: (graph: ArchitectureGraph, format: GraphFormat) => string;
//# sourceMappingURL=renderGraph.d.ts.map