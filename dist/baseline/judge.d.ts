import { ArchitectureError } from "../errors/architectureError.js";
import { type CheckResult } from "../runner/checkResult.js";
import { type BaselineEntry } from "./baselineFile.js";
import { type ChangedSet, type ChangeSource } from "./changedSet.js";
export type JudgeOptions = {
    /** The change whose touched files must be clean; none checks new findings only. */
    readonly change?: ChangeSource;
    /** CI: never write; also fail on a stale baseline and on growth without a reason. Needs a --since change. */
    readonly ci?: boolean;
    /** Write the pruned baseline back; the editor never writes. */
    readonly write: boolean;
};
/** A check's result compared with the baseline, and what that changed on disk. */
export type Verdict = {
    readonly result: CheckResult;
    /** Whether any baseline file exists. */
    readonly hasBaseline: boolean;
    readonly changed?: ChangedSet;
    /** Fixed debt the baseline still lists; pruned automatically outside CI. */
    readonly stale: readonly BaselineEntry[];
    /** CI only: entries that grew since the base without a recorded reason. */
    readonly grown: readonly BaselineEntry[];
    /** Baseline files written, root-relative. */
    readonly written: readonly string[];
    /** Violations recorded now, after pruning. */
    readonly recorded: number;
    /** With --since: violations recorded at the base commit. */
    readonly recordedAtBase?: number;
};
/** Compares a check's findings with the baseline: statuses, pruning (outside CI) and, in CI, growth against the base. */
export declare const judge: (root: string, result: CheckResult, options: JudgeOptions) => Verdict | ArchitectureError;
/** Why the check fails, in order of precedence: new findings, touched files, unapproved growth, a stale baseline (CI). */
export declare const failureCodes: (verdict: Verdict, ci: boolean) => readonly number[];
//# sourceMappingURL=judge.d.ts.map