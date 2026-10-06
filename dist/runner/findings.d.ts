import type { Issue } from "../analysis/inventory.js";
/** Where a finding came from: the structural analysis, Oxlint, or the TypeScript compiler. */
export type FindingSource = "structure" | "lint" | "compiler";
/** One problem the check found, whatever reported it. */
export type Finding = {
    readonly source: FindingSource;
    readonly severity: "error" | "warning";
    /** The architecture rule id when one owns the finding; otherwise the tool's code, such as TS2322. */
    readonly ruleId: string;
    /** The tool's label for the rule, such as architecture(no-let); omitted for structural findings. */
    readonly code?: string;
    readonly file: string;
    readonly line?: number;
    readonly column?: number;
    readonly message: string;
};
export declare const structuralFinding: (issue: Issue) => Finding;
export declare const isError: (finding: Finding) => boolean;
//# sourceMappingURL=findings.d.ts.map