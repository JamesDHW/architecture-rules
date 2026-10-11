import { layerGraph } from "../config/layerGraph.js";
import type { Architecture, DependencyPolicy, EffectivePolicy, NamingPolicy } from "../config/types.js";

export type RuleOverride = { readonly rule: string; readonly severity: string; readonly reason?: string };

/** One external specifier pattern and the layers that list it. */
export type ExternalDependency = { readonly specifier: string; readonly layers: readonly string[] };

export type LayerDescription = {
  readonly name: string;
  readonly description: string;
  readonly files: readonly string[];
  readonly exclude: readonly string[];
  readonly dependencies: Required<DependencyPolicy>;
  /** Present when the layer sets its own naming policy. */
  readonly naming?: NamingPolicy;
  readonly generated?: string;
  readonly ruleOverrides: readonly RuleOverride[];
};

/** Everything describe prints, in the order the decisions are made. */
export type ArchitectureDescription = {
  readonly config: string;
  readonly projects: Architecture["projects"];
  readonly layers: readonly LayerDescription[];
  readonly external: readonly ExternalDependency[];
  readonly cycles: readonly (readonly string[])[];
  readonly naming?: NamingPolicy;
  readonly rules: { readonly on: number; readonly off: number; readonly overrides: readonly RuleOverride[] };
};

/** Rule settings made at origin, as opposed to inherited ones. */
const overridesFrom = (policy: EffectivePolicy, origin: string): readonly RuleOverride[] => {
  return Object.entries(policy.rules)
    .filter(([, rule]) => rule.origin === origin)
    .map(([rule, setting]) => ({ rule, severity: setting.severity, ...(setting.reason === undefined ? {} : { reason: setting.reason }) }));
};

const describeLayer = (architecture: Architecture, name: string): LayerDescription | undefined => {
  const layer = architecture.layers[name];
  if (layer === undefined) return undefined;
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
const externalIndex = (layers: readonly LayerDescription[]): readonly ExternalDependency[] => {
  const specifiers = [...new Set(layers.flatMap((layer) => layer.dependencies.external))].toSorted();
  return specifiers.map((specifier) => ({
    specifier,
    layers: layers.filter((layer) => layer.dependencies.external.includes(specifier)).map((layer) => layer.name),
  }));
};

export const describeArchitecture = (architecture: Architecture, config: string): ArchitectureDescription => {
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
