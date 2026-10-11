import type { ArchitectureDescription } from "./architectureDescription.js";
/** A compact, plain-text summary an agent can read before changing code. */
export declare const renderText: (description: ArchitectureDescription) => string;
/** The layer import graph as a Mermaid flowchart: an arrow points from importer to imported layer. */
export declare const renderMermaid: (description: ArchitectureDescription) => string;
//# sourceMappingURL=renderDescription.d.ts.map