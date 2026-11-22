import type { CheckResult, Stage, StageStatus } from "./checkResult.js";
import { isBlocking, isError, type Finding } from "./findings.js";
import type { RuleGuidance } from "./ruleGuidance.js";

/** Findings outside every layer, such as package.json or a tsconfig, are counted under this name. */
const projectScope = "project";

const plural = (count: number, singular: string, pluralForm = `${singular}s`): string => `${count} ${count === 1 ? singular : pluralForm}`;

const duration = (milliseconds: number): string => (milliseconds < 1000 ? `${milliseconds}ms` : `${(milliseconds / 1000).toFixed(1)}s`);

const header = ({ projects, files, architecture }: CheckResult): string => {
  const layers = Object.keys(architecture.layers).length;
  return `architecture-check · ${plural(projects, "project")} · ${plural(files.length, "file")} · ${plural(layers, "layer")}`;
};

const position = ({ line, column }: Finding): string => {
  if (line === undefined) return "";
  return column === undefined ? String(line) : `${line}:${column}`;
};

type Widths = { readonly position: number; readonly rule: number };

const widths = (findings: readonly Finding[]): Widths => ({
  position: Math.max(0, ...findings.map((finding) => position(finding).length)),
  rule: Math.max(0, ...findings.map((finding) => finding.ruleId.length)),
});

/** A touched finding is recorded debt that fails because the change touches its file. */
const label = (finding: Finding): string => (finding.status === "touched" ? "touched" : finding.severity);

const findingLine = (finding: Finding, { position: positionWidth, rule }: Widths): string => {
  const severity = label(finding).padEnd("warning".length);
  return `  ${position(finding).padEnd(positionWidth)}  ${severity}  ${finding.ruleId.padEnd(rule)}  ${finding.message}`;
};

const findingBlocks = (findings: readonly Finding[]): readonly string[] => {
  const columns = widths(findings);
  const byFile = Map.groupBy(findings, (finding) => finding.file);
  return [...byFile].map(([file, group]) => [file, ...group.map((finding) => findingLine(finding, columns))].join("\n"));
};

/** "name count · name count", most frequent first. */
const tally = (names: readonly string[]): string => {
  const counts = [...Map.groupBy(names, (name) => name)].map(([name, group]) => [name, group.length] as const);
  const byCountThenName = ([leftName, left]: readonly [string, number], [rightName, right]: readonly [string, number]): number => {
    return right === left ? leftName.localeCompare(rightName) : right - left;
  };
  return counts.toSorted(byCountThenName)
    .map(([name, count]) => `${name} ${count}`)
    .join(" · ");
};

const statusMark = (status: StageStatus): string => {
  switch (status) {
    case "passed":
      return "✓";
    case "failed":
      return "✗";
    case "skipped":
      return "skipped";
  }
};

const stageLabel = ({ name, status }: Stage): string => `${name.replace("-", " ")} ${statusMark(status)}`;

/** Recorded debt in untouched files: counted in the summary, not listed. */
const isRecorded = (finding: Finding): boolean => finding.status === "baselined";

const isShown = (finding: Finding): boolean => !isRecorded(finding);

const headline = (findings: readonly Finding[]): string => {
  const errors = findings.filter(isBlocking).length;
  const warnings = findings.length - errors;
  const files = new Set(findings.map((finding) => finding.file)).size;
  if (findings.length === 0) return "✓ No findings";
  const counts = [...(errors > 0 ? [plural(errors, "error")] : []), ...(warnings > 0 ? [plural(warnings, "warning")] : [])].join(" and ");
  return `${errors > 0 ? "✗" : "!"} ${counts} in ${plural(files, "file")}`;
};

const baselineLine = (findings: readonly Finding[]): readonly string[] => {
  const recorded = findings.filter(isRecorded);
  if (recorded.length === 0) return [];
  const files = new Set(recorded.map((finding) => finding.file)).size;
  return [`  baseline:  ${plural(recorded.length, "recorded error")} in ${plural(files, "file")}, not listed`];
};

const summary = (result: CheckResult): string => {
  const layerOf = new Map([...result.files.map((file) => [file.relative, file.layer] as const), [result.configFile, "configuration"] as const]);
  const findings = result.findings.filter(isShown);
  const stages = `${result.stages.map(stageLabel).join(" · ")} · ${duration(result.durationMs)}`;
  const breakdown = findings.length === 0 ? [] : [
    `  by rule:   ${tally(findings.map((finding) => finding.ruleId))}`,
    `  by layer:  ${tally(findings.map((finding) => layerOf.get(finding.file) ?? projectScope))}`,
  ];
  return [headline(findings), ...breakdown, ...baselineLine(result.findings), `  stages:    ${stages}`].join("\n");
};

const guidanceLines = ({ ruleId, instead, docs }: RuleGuidance): readonly string[] => {
  return [`  ${ruleId}: ${instead ?? "see the rule's page"}`, `    ${docs}`];
};

const guidanceBlock = (guidance: readonly RuleGuidance[]): readonly string[] => {
  return guidance.length === 0 ? [] : [`How to fix:\n${guidance.flatMap(guidanceLines).join("\n")}`];
};

const notesBlock = (notes: readonly string[]): readonly string[] => (notes.length === 0 ? [] : [notes.join("\n")]);

/**
 * Findings grouped by file, a summary by rule, layer and stage, then how to fix each rule that fired. Recorded debt
 * in untouched files is counted, not listed; notes (what the baseline did) come last.
 */
export const renderText = (result: CheckResult, guidance: readonly RuleGuidance[], notes: readonly string[] = []): string => {
  const blocks = [header(result), ...findingBlocks(result.findings.filter(isShown)), summary(result), ...guidanceBlock(guidance), ...notesBlock(notes)];
  return `${blocks.join("\n\n")}\n`;
};

/** One JSON document: every finding with its status, the guidance for the rules that reported them, and the summary. */
export const renderJson = (result: CheckResult, guidance: readonly RuleGuidance[], extra: Readonly<Record<string, unknown>> = {}): string => {
  const errors = result.findings.filter(isError).length;
  const summaryData = {
    projects: result.projects,
    files: result.files.length,
    layers: Object.keys(result.architecture.layers).length,
    errors,
    warnings: result.findings.length - errors,
    blocking: result.findings.filter(isBlocking).length,
    baselined: result.findings.filter(isRecorded).length,
    stages: result.stages,
    durationMs: result.durationMs,
  };
  return `${JSON.stringify({ findings: result.findings, rules: guidance, summary: summaryData, ...extra }, null, 2)}\n`;
};

const agentLine = (finding: Finding): string => {
  const at = finding.line === undefined ? finding.file : `${finding.file}:${position(finding)}`;
  const touched = finding.status === "touched" ? " (recorded debt in a file you changed: fix it)" : "";
  return `${at} ${finding.ruleId}: ${finding.message}${touched}`;
};

/**
 * For agent hooks: only what must change, one line per finding, then one line per rule on what to write instead.
 * Nothing at all when the files are clean, so a passing hook adds nothing to the agent's context.
 */
export const renderAgent = (result: CheckResult, guidance: readonly RuleGuidance[], notes: readonly string[] = []): string => {
  const blocking = result.findings.filter(isBlocking);
  if (blocking.length === 0) return "";
  const rules = new Set(blocking.map((finding) => finding.ruleId));
  const fixes = guidance.filter((entry) => rules.has(entry.ruleId)).map((entry) => `fix ${entry.ruleId}: ${entry.instead ?? "see the rule's page"} (${entry.docs})`);
  return `${[...blocking.map(agentLine), ...fixes, ...notes].join("\n")}\n`;
};
