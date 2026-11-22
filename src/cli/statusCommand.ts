import { baseState } from "../baseline/growth.js";
import { judge } from "../baseline/judge.js";
import { ArchitectureError } from "../errors/architectureError.js";
import type { CheckResult } from "../runner/checkResult.js";
import { isBlocking, isError, type Finding } from "../runner/findings.js";
import { inspectProject } from "./inspectProject.js";
import { renderStatus, type LayerStatus } from "./renderStatus.js";

type StatusArgs = { readonly target: string; readonly config?: string; readonly json: boolean; readonly since?: string };

/** Errors recorded as debt, whether the change touches their file or not. */
const isRecorded = (finding: Finding): boolean => isError(finding) && (finding.status === "baselined" || finding.status === "touched");

const tallyRules = (findings: readonly Finding[]): readonly { readonly rule: string; readonly count: number }[] => {
  return [...Map.groupBy(findings, (finding) => finding.ruleId)]
    .map(([rule, group]) => ({ rule, count: group.length }))
    .toSorted((left, right) => (right.count === left.count ? left.rule.localeCompare(right.rule) : right.count - left.count));
};

const layerStatus = (result: CheckResult, recordedAtBase: ReadonlyMap<string, number> | undefined) => (layer: string): LayerStatus => {
  const files = result.files.filter((file) => file.layer === layer);
  const paths = new Set(files.map((file) => file.relative));
  const findings = result.findings.filter((finding) => paths.has(finding.file));
  const failing = new Set(findings.filter(isError).map((finding) => finding.file));
  const recorded = findings.filter(isRecorded);
  return {
    layer,
    files: files.length,
    compliant: files.length - failing.size,
    new: findings.filter((finding) => isBlocking(finding) && finding.status !== "touched").length,
    recorded: recorded.length,
    ...(recordedAtBase === undefined ? {} : { recordedAtBase: recordedAtBase.get(layer) ?? 0 }),
    exceptions: result.exceptions.filter((exception) => paths.has(exception.file)).length,
    recordedByRule: tallyRules(recorded),
  };
};

const countsByLayer = (result: CheckResult, entries: readonly { readonly file: string; readonly count: number }[]): ReadonlyMap<string, number> => {
  const layers = new Map(result.files.map((file) => [file.relative, file.layer]));
  const byLayer = Map.groupBy(entries, (entry) => layers.get(entry.file) ?? "project");
  return new Map([...byLayer].map(([layer, group]) => [layer, group.reduce((total, entry) => total + entry.count, 0)]));
};

/** Per layer: how many files comply, what debt is recorded and by which rules, and with --since how that changed. */
export const statusCommand = async (args: StatusArgs): Promise<number | ArchitectureError> => {
  const inspected = await inspectProject(args.target, args.config);
  if (inspected instanceof ArchitectureError) return inspected;
  const { root, result } = inspected;
  const verdict = judge(root, result, { write: false, ...(args.since === undefined ? {} : { change: { kind: "since", ref: args.since } }) });
  if (verdict instanceof ArchitectureError) return verdict;
  const { changed } = verdict;
  const state = changed?.base === undefined ? undefined : baseState(root, result.workspaces, { ...changed, base: changed.base });
  if (state instanceof ArchitectureError) return state;
  const atBase = state === undefined ? undefined : countsByLayer(verdict.result, [...state.baseline.values()]);
  const rows = Object.keys(result.architecture.layers).map(layerStatus(verdict.result, atBase));
  process.stdout.write(renderStatus(rows, verdict, args.json));
  return 0;
};
