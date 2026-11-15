import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Suppression } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import { isError, type Finding, type FindingSource } from "./findings.js";

/** The stages of a check, in the order they run. */
export type StageName = "structure" | "lint" | "types";
export type StageStatus = "passed" | "failed" | "skipped";
export type Stage = { readonly name: StageName; readonly status: StageStatus };

/** What one check found, ready for any output: text, JSON, the Markdown report or the language server. */
export type CheckResult = {
  readonly architecture: Architecture;
  readonly projects: number;
  /** The classified files in scope: every file, or the --file selection. */
  readonly files: readonly ClassifiedFile[];
  readonly findings: readonly Finding[];
  readonly suppressions: readonly Suppression[];
  readonly stages: readonly Stage[];
  readonly durationMs: number;
};

export type CheckScope = {
  readonly architecture: Architecture;
  readonly projects: number;
  readonly files: readonly ClassifiedFile[];
  /** performance.now() when the check started. */
  readonly started: number;
};

const stageNames: readonly StageName[] = ["structure", "lint", "types"];

const stageOf = (source: FindingSource): StageName => {
  switch (source) {
    case "structure":
      return "structure";
    case "lint":
      return "lint";
    case "compiler":
      return "types";
  }
};

const stageStatus = (name: StageName, findings: readonly Finding[], ranPastStructure: boolean): StageStatus => {
  const failed = findings.some((finding) => isError(finding) && stageOf(finding.source) === name);
  if (failed) return "failed";
  const isSkipped = !ranPastStructure && name !== "structure";
  return isSkipped ? "skipped" : "passed";
};

/** Assembles a check's result; stages after structure are skipped when structural findings stopped the run. */
export const checkResult = (
  scope: CheckScope, findings: readonly Finding[], suppressions: readonly Suppression[], ranPastStructure: boolean,
): CheckResult => ({
  architecture: scope.architecture,
  projects: scope.projects,
  files: scope.files,
  findings,
  suppressions,
  stages: stageNames.map((name) => ({ name, status: stageStatus(name, findings, ranPastStructure) })),
  durationMs: Math.round(performance.now() - scope.started),
});

export const hasErrors = (result: CheckResult): boolean => result.findings.some(isError);
