import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Architecture, EffectiveRule } from "../config/types.js";
import { rules } from "../rules/index.js";
import type { CheckResult } from "./checkResult.js";
import type { Finding } from "./findings.js";

const cell = (text: string): string => text.replaceAll("|", "\\|").replaceAll("\n", " ");

const table = (header: readonly string[], rows: readonly (readonly string[])[], empty: string): string => {
  if (rows.length === 0) return empty;
  const line = (cells: readonly string[]): string => `| ${cells.map(cell).join(" | ")} |`;
  return [line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n");
};

const countBy = <Value>(values: readonly Value[], key: (value: Value) => string): ReadonlyMap<string, number> => {
  return new Map(Object.entries(Object.groupBy(values, key)).map(([name, group]) => [name, group?.length ?? 0]));
};

const findingRows = (findings: readonly Finding[]): readonly (readonly string[])[] => {
  const errors = countBy(findings.filter((finding) => finding.severity === "error"), (finding) => finding.ruleId);
  const warnings = countBy(findings.filter((finding) => finding.severity === "warning"), (finding) => finding.ruleId);
  const ruleIds = [...new Set(findings.map((finding) => finding.ruleId))].toSorted();
  return ruleIds.map((ruleId) => [ruleId, String(errors.get(ruleId) ?? 0), String(warnings.get(ruleId) ?? 0)]);
};

const setting = ({ severity, options }: EffectiveRule): string => (options.length === 0 ? severity : `${severity} ${JSON.stringify(options)}`);

/** Rules a scope declares itself, rather than inherits. */
const declaredOverrides = (scope: string, effective: Readonly<Record<string, EffectiveRule>>): readonly (readonly string[])[] => {
  return Object.entries(effective)
    .filter(([, rule]) => rule.origin === scope)
    .map(([ruleId, rule]) => [scope, ruleId, setting(rule), rule.reason ?? ""]);
};

const overrideRows = (architecture: Architecture): readonly (readonly string[])[] => [
  ...declaredOverrides("architecture", architecture.defaults.rules),
  ...Object.entries(architecture.layers).flatMap(([name, layer]) => declaredOverrides(`layers.${name}`, layer.policy.rules)),
];

const layerRows = (architecture: Architecture, files: readonly ClassifiedFile[]): readonly (readonly string[])[] => {
  const counts = countBy(files, (file) => file.layer);
  return Object.entries(architecture.layers).map(([name, layer]) => {
    const generated = layer.policy.generated === undefined ? "" : `generated: ${layer.policy.generated.reason}`;
    return [name, String(counts.get(name) ?? 0), [layer.description, generated].filter((part) => part.length > 0).join(" ")];
  });
};

const advisoryLines = (): readonly string[] => {
  return rules.filter((rule) => rule.enforcement.type === "advisory").map((rule) => `- \`${rule.id}\`: ${rule.title}`);
};

/** A Markdown report of the check: findings by rule, every suppression, configuration overrides and layers. */
export const renderReport = ({ architecture, files, findings, suppressions }: CheckResult): string => {
  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const summary = `${files.length} source files in ${Object.keys(architecture.layers).length} layers. `
    + `${errorCount} errors, ${findings.length - errorCount} warnings, ${suppressions.length} suppressions.`;
  const suppressionRows = suppressions.map(({ file, line, rules: ruleNames, reason }) => [file, String(line), ruleNames.join(", "), reason]);
  return [
    "# Architecture report",
    summary,
    "## Findings by rule",
    table(["Rule", "Errors", "Warnings"], findingRows(findings), "None."),
    "## Suppressions",
    table(["File", "Line", "Rules", "Reason"], suppressionRows, "None."),
    "## Configuration overrides",
    table(["Where", "Rule", "Setting", "Reason"], overrideRows(architecture), "None."),
    "## Layers",
    table(["Layer", "Files", "Description"], layerRows(architecture, files), "None."),
    "## Not checked automatically",
    advisoryLines().join("\n"),
  ].join("\n\n").concat("\n");
};
