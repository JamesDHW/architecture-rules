import { layerGraph } from "../config/layerGraph.js";
/** Rule settings made at origin, as opposed to inherited ones. */
const overridesFrom = (policy, origin) => {
    return Object.entries(policy.rules)
        .filter(([, rule]) => rule.origin === origin)
        .map(([rule, setting]) => ({ rule, severity: setting.severity, ...(setting.reason === undefined ? {} : { reason: setting.reason }) }));
};
const describeLayer = (architecture, name) => {
    const layer = architecture.layers[name];
    if (layer === undefined)
        return undefined;
    const { policy } = layer;
    const origin = `layers.${name}`;
    const ownsNaming = policy.origins.naming === origin && policy.naming !== undefined;
    return {
        name,
        description: layer.description,
        files: layer.files,
        exclude: layer.exclude ?? [],
        dependencies: policy.dependencies,
        ...(ownsNaming ? { naming: policy.naming } : {}),
        ...(policy.generated === undefined ? {} : { generated: policy.generated.reason }),
        ruleOverrides: overridesFrom(policy, origin),
    };
};
/** The inverse of each layer's external list: which layers may import each package or built-in. */
const externalIndex = (layers) => {
    const specifiers = [...new Set(layers.flatMap((layer) => layer.dependencies.external))].toSorted();
    return specifiers.map((specifier) => ({
        specifier,
        layers: layers.filter((layer) => layer.dependencies.external.includes(specifier)).map((layer) => layer.name),
    }));
};
export const describeArchitecture = (architecture, config) => {
    const graph = layerGraph(architecture);
    const settings = Object.values(architecture.defaults.rules);
    const off = settings.filter((setting) => setting.severity === "off").length;
    const layers = graph.order.map((name) => describeLayer(architecture, name)).filter((layer) => layer !== undefined);
    return {
        config,
        projects: architecture.projects,
        layers,
        external: externalIndex(layers),
        cycles: graph.cycles,
        ...(architecture.defaults.naming === undefined ? {} : { naming: architecture.defaults.naming }),
        rules: { on: settings.length - off, off, overrides: overridesFrom(architecture.defaults, "architecture") },
    };
};
//# sourceMappingURL=architectureDescription.js.map