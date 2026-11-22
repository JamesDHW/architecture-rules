export const unknownLayers = (architecture, layers) => {
    return layers.filter((layer) => architecture.layers[layer] === undefined);
};
/** The import issue a lint finding reports: the engine repeats the issue's message and line. */
const issueFor = (issues, finding) => {
    return issues.find((issue) => issue.file === finding.file && issue.line === finding.line && finding.message.startsWith(issue.message));
};
const layerOf = (result) => {
    const layers = new Map(result.files.map((file) => [file.relative, file.layer]));
    return (file) => layers.get(file);
};
/**
 * The findings the layers own: those in their files. With incoming, instead the denied imports from other layers'
 * files into these layers: who reaches in.
 */
export const layerFindings = (result, layers, incoming) => {
    const wanted = new Set(layers);
    const layer = layerOf(result);
    const owned = (finding) => wanted.has(layer(finding.file) ?? "");
    if (!incoming)
        return result.findings.filter(owned);
    const issues = result.imports?.issues ?? [];
    return result.findings.filter((finding) => {
        const target = issueFor(issues, finding)?.target;
        const isIncoming = target !== undefined && wanted.has(target.layer);
        return isIncoming && !owned(finding);
    });
};
//# sourceMappingURL=layerScope.js.map