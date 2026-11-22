import type { Issue } from "../analysis/inventory.js";

/** Which stage of the check reported a finding. */
export type FindingSource = "structure" | "lint" | "compiler" | "dead-code";

/**
 * Where a finding stands against the baseline: new (not recorded there), touched (recorded, but in a file the change
 * touches, under a rule that must then be fixed) or baselined (recorded debt, which passes).
 */
export type FindingStatus = "new" | "touched" | "baselined";

/** One problem the check found, whatever reported it. Every output (text, JSON, report, editor) renders these. */
export type Finding = {
  readonly source: FindingSource;
  readonly severity: "error" | "warning";
  /** The architecture rule id that owns the finding; a compiler error's code, such as TS2322, otherwise. */
  readonly ruleId: string;
  /** Root-relative path, with forward slashes. */
  readonly file: string;
  /** 1-based. */
  readonly line?: number;
  /** 1-based. */
  readonly column?: number;
  readonly message: string;
  /** Set once the finding is compared with a baseline; a finding without one is new. */
  readonly status?: FindingStatus;
};

export const structuralFinding = (issue: Issue): Finding => ({
  source: "structure",
  severity: "error",
  ruleId: issue.ruleId,
  file: issue.file,
  ...(issue.line === undefined ? {} : { line: issue.line }),
  message: issue.message,
});

export const isError = (finding: Finding): boolean => finding.severity === "error";

/** An error that fails the check: every error but recorded debt in a file the change did not touch. */
export const isBlocking = (finding: Finding): boolean => isError(finding) && finding.status !== "baselined";

const byPosition = (left: Finding, right: Finding): number => {
  const byFile = left.file.localeCompare(right.file);
  if (byFile !== 0) return byFile;
  const byLine = (left.line ?? 0) - (right.line ?? 0);
  if (byLine !== 0) return byLine;
  const byColumn = (left.column ?? 0) - (right.column ?? 0);
  if (byColumn !== 0) return byColumn;
  const byRule = left.ruleId.localeCompare(right.ruleId);
  return byRule === 0 ? left.message.localeCompare(right.message) : byRule;
};

/** Findings in file, line, column, rule and message order, so every output lists them the same way. */
export const sortFindings = (findings: readonly Finding[]): readonly Finding[] => findings.toSorted(byPosition);
