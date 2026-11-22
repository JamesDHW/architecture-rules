import type { ArchitectureGraph, GraphEdge, GraphNode } from "./architectureGraph.js";
import type { GraphFormat } from "./cliArgs.js";

const targets = (edges: readonly GraphEdge[], from: string, state: GraphEdge["state"]): readonly GraphEdge[] => {
  return edges.filter((edge) => edge.from === from && edge.state === state);
};

const labelOf = (graph: ArchitectureGraph) => (id: string): string => graph.nodes.find((node) => node.id === id)?.label ?? id;

/**
 * One line per node: what it imports as allowed, then the imports the rules deny (✗, with a count) and the allowed
 * dependencies nothing uses (○). Plain text, so it reads in any terminal and diffs cleanly.
 */
const renderText = (graph: ArchitectureGraph): string => {
  const label = labelOf(graph);
  const width = Math.max(0, ...graph.nodes.map((node) => node.label.length));
  const rows = graph.nodes.map((node) => {
    const used = targets(graph.edges, node.id, "used").map((edge) => label(edge.to));
    const denied = targets(graph.edges, node.id, "violating").map((edge) => `✗ ${label(edge.to)} (${edge.count ?? 0})`);
    const unused = targets(graph.edges, node.id, "unused").map((edge) => `○ ${label(edge.to)} (allowed, unused)`);
    const allowed = `${node.label.padEnd(width)}  → ${used.length === 0 ? "(none)" : used.join(", ")}`;
    return [allowed, ...denied, ...unused].join("     ");
  });
  const legend = "✗ denied imports (count)   ○ allowed but unused";
  return `${[...rows, "", legend].join("\n")}\n`;
};

const mermaidId = (graph: ArchitectureGraph) => (id: string): string => `n${graph.nodes.findIndex((node) => node.id === id)}`;

const mermaidNode = (node: GraphNode, index: number): string => `  n${index}["${node.label.replaceAll("\"", "'")} (${node.files})"]`;

const mermaidArrow = (edge: GraphEdge): string => {
  switch (edge.state) {
    case "used":
      return "-->";
    case "unused":
      return "-.->";
    case "violating":
      return `-->|✗ ${edge.count ?? 0}|`;
  }
};

/** A Mermaid flowchart: denied imports in red, unused allowances dashed. GitHub and GitLab render it in Markdown. */
export const renderMermaid = (graph: ArchitectureGraph): string => {
  const id = mermaidId(graph);
  const edges = graph.edges.map((edge) => `  ${id(edge.from)} ${mermaidArrow(edge)} ${id(edge.to)}`);
  const red = graph.edges.flatMap((edge, index) => (edge.state === "violating" ? [`  linkStyle ${index} stroke:#d33,stroke-width:2px,color:#d33`] : []));
  return `${["flowchart LR", ...graph.nodes.map(mermaidNode), ...edges, ...red].join("\n")}\n`;
};

const dotAttributes = (edge: GraphEdge): string => {
  switch (edge.state) {
    case "used":
      return "";
    case "unused":
      return " [style=dashed, color=gray]";
    case "violating":
      return ` [color=red, fontcolor=red, label="${edge.count ?? 0}"]`;
  }
};

/** Graphviz: copes with more nodes than Mermaid, and any tool that reads dot can draw it. */
const renderDot = (graph: ArchitectureGraph): string => {
  const nodes = graph.nodes.map((node) => `  ${JSON.stringify(node.id)} [label=${JSON.stringify(`${node.label} (${node.files})`)}];`);
  const edges = graph.edges.map((edge) => `  ${JSON.stringify(edge.from)} -> ${JSON.stringify(edge.to)}${dotAttributes(edge)};`);
  return `${["digraph architecture {", "  rankdir=LR;", "  node [shape=box];", ...nodes, ...edges, "}"].join("\n")}\n`;
};

export const renderGraph = (graph: ArchitectureGraph, format: GraphFormat): string => {
  switch (format) {
    case "text":
      return renderText(graph);
    case "json":
      return `${JSON.stringify(graph, null, 2)}\n`;
    case "mermaid":
      return renderMermaid(graph);
    case "dot":
      return renderDot(graph);
  }
};
