import { asList } from "../rules/namingPolicy.js";
import type { NamingPolicy } from "../config/types.js";
import type { ArchitectureDescription, LayerDescription, RuleOverride } from "./architectureDescription.js";

const indent = "  ";
/** Lines up continuation lines under the values of the Project-wide section. */
const valueIndent = " ".repeat(11);

const column = (label: string, width: number): string => label.padEnd(width);

const describeNaming = (naming: NamingPolicy): string => {
  const prefix = asList(naming.prefix);
  const required = asList(naming.requiredSuffix);
  return [
    asList(naming.case).join(" or "),
    ...(prefix.length > 0 ? [`prefix ${prefix.join(" or ")}`] : []),
    ...(required.length > 0 ? [`requires ${required.join(" or ")}`] : []),
    ...((naming.suffixes ?? []).length > 0 ? [`suffixes ${(naming.suffixes ?? []).join(" ")}`] : []),
    ...((naming.allowedNames ?? []).length > 0 ? [`allows ${(naming.allowedNames ?? []).join(" ")}`] : []),
  ].join(", ");
};

const listOrNone = (values: readonly string[]): string => (values.length > 0 ? values.join(", ") : "none");

const describeOverride = ({ rule, severity, reason }: RuleOverride): string => `${rule} ${severity}${reason === undefined ? "" : `: ${reason}`}`;

const layerLines = (layer: LayerDescription, width: number): readonly string[] => {
  const detail = (label: string, value: string): string => `${indent}${" ".repeat(width)}  ${column(label, 10)}${value}`;
  return [
    `${indent}${column(layer.name, width)}  ${layer.description}`,
    detail("files", [...layer.files, ...layer.exclude.map((pattern) => `!${pattern}`)].join(", ")),
    detail("internal", listOrNone(layer.dependencies.internal)),
    detail("external", listOrNone(layer.dependencies.external)),
    ...(layer.dependencies.assets.length > 0 ? [detail("assets", layer.dependencies.assets.join(", "))] : []),
    ...(layer.naming === undefined ? [] : [detail("naming", describeNaming(layer.naming))]),
    ...(layer.generated === undefined ? [] : [detail("generated", layer.generated)]),
    ...layer.ruleOverrides.map((override) => detail("rule", describeOverride(override))),
  ];
};

const cycleLine = (cycles: ArchitectureDescription["cycles"]): string => {
  if (cycles.length === 0) return `${indent}No import cycles between layers.`;
  return `${indent}Import cycles: ${cycles.map((cycle) => cycle.join(" ↔ ")).join("; ")}`;
};

/** A compact, plain-text summary an agent can read before changing code. */
export const renderText = (description: ArchitectureDescription): string => {
  const width = Math.max(...description.layers.map((layer) => layer.name.length), 6);
  const externalWidth = Math.max(...description.external.map(({ specifier }) => specifier.length), 6);
  const { projects, rules } = description;
  return [
    `Architecture (${description.config})`,
    "",
    "TypeScript projects",
    `${indent}${projects.tsconfigs.join(", ")} (references: ${projects.references})`,
    "",
    "Layers, in dependency order (every source file belongs to exactly one)",
    ...description.layers.flatMap((layer) => layerLines(layer, width)),
    cycleLine(description.cycles),
    "",
    "External dependencies, and the layers that may import them",
    ...(description.external.length === 0
      ? [`${indent}none`]
      : description.external.map(({ specifier, layers }) => `${indent}${column(specifier, externalWidth)}  ${layers.join(", ")}`)),
    "",
    "Project-wide",
    `${indent}naming   ${description.naming === undefined ? "none" : describeNaming(description.naming)}`,
    `${indent}rules    ${rules.on} on, ${rules.off} off`,
    ...rules.overrides.map((override) => `${valueIndent}${describeOverride(override)}`),
    "",
  ].join("\n");
};

/** The layer import graph as a Mermaid flowchart: an arrow points from importer to imported layer. */
export const renderMermaid = (description: ArchitectureDescription): string => {
  const edges = description.layers.flatMap((layer) => {
    return layer.dependencies.internal.filter((imported) => imported !== layer.name).map((imported) => `${indent}${layer.name} --> ${imported}`);
  });
  return ["flowchart TD", ...description.layers.map((layer) => `${indent}${layer.name}`), ...edges, ""].join("\n");
};
