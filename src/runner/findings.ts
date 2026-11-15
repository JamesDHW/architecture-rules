import type { Issue } from "../analysis/inventory.js";

/** Which stage of the check reported a finding. */
export type FindingSource = "structure" | "lint" | "compiler";

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

const byPosition = (left: Finding, right: Finding): number => {
  const byFile = left.file.localeCompare(right.file);
  if (byFile !== 0) return byFile;
  const byLine = (left.line ?? 0) - (right.line ?? 0);
  if (byLine !== 0) return byLine;
  return (left.column ?? 0) - (right.column ?? 0);
};

/** Findings in file, line and column order, so every output lists them the same way. */
export const sortFindings = (findings: readonly Finding[]): readonly Finding[] => findings.toSorted(byPosition);
