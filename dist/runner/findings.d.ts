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
export declare const structuralFinding: (issue: Issue) => Finding;
export declare const isError: (finding: Finding) => boolean;
/** Findings in file, line and column order, so every output lists them the same way. */
export declare const sortFindings: (findings: readonly Finding[]) => readonly Finding[];
//# sourceMappingURL=findings.d.ts.map