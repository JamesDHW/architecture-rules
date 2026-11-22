import { posix } from "node:path";
const layerNodes = (result, skip) => {
    const counts = Map.groupBy(result.files, (file) => file.layer);
    return Object.keys(result.architecture.layers)
        .filter((name) => name !== skip)
        .map((name) => ({ id: name, label: name, kind: "layer", files: counts.get(name)?.length ?? 0 }));
};
/** An edge key between two different placed nodes; nothing for an import within one node. */
const crossing = (from, to) => {
    const isPlaced = from !== undefined && to !== undefined;
    if (!isPlaced)
        return [];
    return from === to ? [] : [`${from}\0${to}`];
};
const deniedEdges = (issues, place) => {
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
const linkEdges = (links, place) => {
    return new Set(links.flatMap((link) => {
        return crossing(place(link.from), place(link.to));
    }));
};
const layerPlacement = (result) => {
    const layers = new Map(result.files.map((file) => [file.relative, file.layer]));
    return (file) => layers.get(file);
};
/** Every layer, each allowed dependency used or unused, and the denied imports between layers with their counts. */
const layerGraph = (result) => {
    const place = layerPlacement(result);
    const used = linkEdges(result.imports?.links ?? [], place);
    const allowed = Object.entries(result.architecture.layers).flatMap(([from, layer]) => layer.policy.dependencies.internal
        .filter((to) => to !== from)
        .map((to) => ({ from, to, state: used.has(`${from}\0${to}`) ? "used" : "unused" })));
    return { version: 1, nodes: layerNodes(result, undefined), edges: [...allowed, ...deniedEdges(result.imports?.issues ?? [], place)] };
};
/** Directories stand in for a layer's files: grouping by file would draw every import. */
const directoryOf = (file) => posix.dirname(file);
/** One layer expanded into its directories; every other layer stays one node. Unused dependencies are not drawn. */
const expandedGraph = (result, layer) => {
    const layers = layerPlacement(result);
    const place = (file) => (layers(file) === layer ? `${layer}/${directoryOf(file)}` : layers(file));
    const inLayer = result.files.filter((file) => file.layer === layer);
    const directories = [...Map.groupBy(inLayer, (file) => directoryOf(file.relative))].map(([directory, files]) => ({
        id: `${layer}/${directory}`, label: directory, kind: "directory", files: files.length,
    }));
    const isLayerEdge = (edge) => edge.from.startsWith(`${layer}/`) || edge.to.startsWith(`${layer}/`);
    const used = [...linkEdges(result.imports?.links ?? [], place)].map((pair) => {
        const [from = "", to = ""] = pair.split("\0");
        return { from, to, state: "used" };
    });
    const edges = [...used, ...deniedEdges(result.imports?.issues ?? [], place)].filter(isLayerEdge);
    return { version: 1, layer, nodes: [...directories, ...layerNodes(result, layer)], edges };
};
/** The architecture graph: layers, or one layer expanded into its directories. */
export const architectureGraph = (result, layer) => {
    return layer === undefined ? layerGraph(result) : expandedGraph(result, layer);
};
//# sourceMappingURL=architectureGraph.js.map