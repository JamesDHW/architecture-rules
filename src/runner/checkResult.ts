import type { ImportAnalysis } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { LineException } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import { isBlocking, type Finding, type FindingSource } from "./findings.js";

/** The stages of a check, in the order they run. */
type StageName = "structure" | "lint" | "types" | "program" | "dead-code";
export type StageStatus = "passed" | "failed" | "skipped";
export type Stage = { readonly name: StageName; readonly status: StageStatus };

/** What one check found, ready for any output: text, JSON, the Markdown report or the language server. */
export type CheckResult = {
  readonly architecture: Architecture;
  /** architecture.config.ts, root-relative: findings about it are counted as configuration, not under a layer. */
  readonly configFile: string;
  readonly projects: number;
  /** The classified files in scope: every file, or the --file selection. */
  readonly files: readonly ClassifiedFile[];
  readonly findings: readonly Finding[];
  readonly exceptions: readonly LineException[];
  readonly stages: readonly Stage[];
  readonly durationMs: number;
  /** False when structural findings stopped the run before lint, types and dead code. */
  readonly complete: boolean;
  /** Workspace package directories, root-relative, longest first; from every file, whatever the selection. */
  readonly workspaces: readonly string[];
  /** Whether a --file selection limited the findings to some files. */
  readonly partial: boolean;
  /** Every import problem and every permission an import used; absent when structure stopped the run. */
  readonly imports?: ImportAnalysis;
};

export type CheckScope = {
  readonly architecture: Architecture;
  readonly configFile: string;
  readonly projects: number;
  readonly files: readonly ClassifiedFile[];
  readonly workspaces: readonly string[];
  readonly partial: boolean;
  /** performance.now() when the check started. */
  readonly started: number;
};

const stageNames: readonly StageName[] = ["structure", "lint", "types", "program", "dead-code"];

const stageOf = (source: FindingSource): StageName => {
  switch (source) {
    case "structure":
      return "structure";
    case "lint":
      return "lint";
    case "compiler":
      return "types";
    case "program":
      return "program";
    case "dead-code":
      return "dead-code";
  }
};

const stageStatus = (name: StageName, findings: readonly Finding[], ranPastStructure: boolean): StageStatus => {
  const failed = findings.some((finding) => isBlocking(finding) && stageOf(finding.source) === name);
  if (failed) return "failed";
  const isSkipped = !ranPastStructure && name !== "structure";
  return isSkipped ? "skipped" : "passed";
};

const stagesFor = (findings: readonly Finding[], ranPastStructure: boolean): readonly Stage[] => {
  return stageNames.map((name) => ({ name, status: stageStatus(name, findings, ranPastStructure) }));
};

/** Assembles a check's result; stages after structure are skipped when structural findings stopped the run. */
export const checkResult = (
  scope: CheckScope, findings: readonly Finding[], exceptions: readonly LineException[], imports: ImportAnalysis | undefined,
): CheckResult => ({
  architecture: scope.architecture,
  configFile: scope.configFile,
  projects: scope.projects,
  files: scope.files,
  workspaces: scope.workspaces,
  partial: scope.partial,
  findings,
  exceptions,
  stages: stagesFor(findings, imports !== undefined),
  durationMs: Math.round(performance.now() - scope.started),
  complete: imports !== undefined,
  ...(imports === undefined ? {} : { imports }),
});

/** The same result with findings compared against a baseline; stages are judged again, since recorded debt passes. */
export const withFindings = (result: CheckResult, findings: readonly Finding[]): CheckResult => ({
  ...result,
  findings,
  stages: stagesFor(findings, result.complete),
});

/** Whether any finding fails the check; recorded debt in untouched files does not. */
export const hasErrors = (result: CheckResult): boolean => result.findings.some(isBlocking);
