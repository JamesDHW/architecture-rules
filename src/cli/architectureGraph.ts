import { posix } from "node:path";

import type { ImportIssue, ImportLink } from "../analysis/imports.js";
import type { CheckResult } from "../runner/checkResult.js";

/** An edge's state: an allowed dependency some import uses, one nothing uses, or imports the rules deny. */
type EdgeState = "used" | "unused" | "violating";

export type GraphNode = { readonly id: string; readonly label: string; readonly kind: "layer" | "directory"; readonly files: number };

export type GraphEdge = { readonly from: string; readonly to: string; readonly state: EdgeState; readonly count?: number };

/** The architecture as the rules declare it, overlaid with what the code imports. */
export type ArchitectureGraph = { readonly version: 1; readonly layer?: string; readonly nodes: readonly GraphNode[]; readonly edges: readonly GraphEdge[] };

type Placement = (file: string) => string | undefined;

const layerNodes = (result: CheckResult, skip: string | undefined): readonly GraphNode[] => {
  const counts = Map.groupBy(result.files, (file) => file.layer);
  return Object.keys(result.architecture.layers)
    .filter((name) => name !== skip)
    .map((name) => ({ id: name, label: name, kind: "layer", files: counts.get(name)?.length ?? 0 }));
};

/** An edge key between two different placed nodes; nothing for an import within one node. */
const crossing = (from: string | undefined, to: string | undefined): readonly string[] => {
  const isPlaced = from !== undefined && to !== undefined;
  if (!isPlaced) return [];
  return from === to ? [] : [`${from}\0${to}`];
};

const deniedEdges = (issues: readonly ImportIssue[], place: Placement): readonly GraphEdge[] => {
  const pairs = issues.flatMap((issue) => {
    const from = place(issue.file);
    const to = issue.target === undefined ? undefined : place(issue.target.file);
    return crossing(from, to);
  });
  return [...Map.groupBy(pairs, (pair) => pair)].map(([pair, group]) => {
    const [from = "", to = ""] = pair.split("\0");
    return { from, to, state: "violating", count: group.length };
  });
};

const linkEdges = (links: readonly ImportLink[], place: Placement): ReadonlySet<string> => {
  return new Set(links.flatMap((link) => {
    return crossing(place(link.from), place(link.to));
  }));
};

const layerPlacement = (result: CheckResult): Placement => {
  const layers = new Map(result.files.map((file) => [file.relative, file.layer]));
  return (file) => layers.get(file);
};

/** Every layer, each allowed dependency used or unused, and the denied imports between layers with their counts. */
const layerGraph = (result: CheckResult): ArchitectureGraph => {
  const place = layerPlacement(result);
  const used = linkEdges(result.imports?.links ?? [], place);
  const allowed = Object.entries(result.architecture.layers).flatMap(([from, layer]) => layer.policy.dependencies.internal
    .filter((to) => to !== from)
    .map((to): GraphEdge => ({ from, to, state: used.has(`${from}\0${to}`) ? "used" : "unused" })));
  return { version: 1, nodes: layerNodes(result, undefined), edges: [...allowed, ...deniedEdges(result.imports?.issues ?? [], place)] };
};

/** Directories stand in for a layer's files: grouping by file would draw every import. */
const directoryOf = (file: string): string => posix.dirname(file);

/** One layer expanded into its directories; every other layer stays one node. Unused dependencies are not drawn. */
const expandedGraph = (result: CheckResult, layer: string): ArchitectureGraph => {
  const layers = layerPlacement(result);
  const place: Placement = (file) => (layers(file) === layer ? `${layer}/${directoryOf(file)}` : layers(file));
  const inLayer = result.files.filter((file) => file.layer === layer);
  const directories = [...Map.groupBy(inLayer, (file) => directoryOf(file.relative))].map(([directory, files]): GraphNode => ({
    id: `${layer}/${directory}`, label: directory, kind: "directory", files: files.length,
  }));
  const isLayerEdge = (edge: GraphEdge): boolean => edge.from.startsWith(`${layer}/`) || edge.to.startsWith(`${layer}/`);
  const used = [...linkEdges(result.imports?.links ?? [], place)].map((pair): GraphEdge => {
    const [from = "", to = ""] = pair.split("\0");
    return { from, to, state: "used" };
  });
  const edges = [...used, ...deniedEdges(result.imports?.issues ?? [], place)].filter(isLayerEdge);
  return { version: 1, layer, nodes: [...directories, ...layerNodes(result, layer)], edges };
};

/** The architecture graph: layers, or one layer expanded into its directories. */
export const architectureGraph = (result: CheckResult, layer: string | undefined): ArchitectureGraph => {
  return layer === undefined ? layerGraph(result) : expandedGraph(result, layer);
};
