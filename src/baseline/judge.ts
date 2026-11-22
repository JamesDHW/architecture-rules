import { existsSync } from "node:fs";
import { join } from "node:path";

import { rootWorkspace } from "../analysis/workspaces.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { withFindings, type CheckResult } from "../runner/checkResult.js";
import { isBlocking, type Finding } from "../runner/findings.js";
import { baselinePath, readBaseline, writeBaseline, type Baseline, type BaselineEntry } from "./baselineFile.js";
import { changedFiles, type ChangedSet, type ChangeSource } from "./changedSet.js";
import { EXIT_GROWN, EXIT_NEW, EXIT_STALE, EXIT_TOUCHED } from "./gates.constants.js";
import { stage } from "./git.js";
import { acceptedSince, baseState, recordedTotal, unapprovedGrowth, type BaseState } from "./growth.js";
import { ratchet } from "./ratchet.js";

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

const baselineExists = (root: string, workspaces: readonly string[]): boolean => {
  return [rootWorkspace, ...workspaces].some((workspace) => existsSync(join(root, baselinePath(workspace))));
};

const changeOf = (root: string, change: ChangeSource | undefined): ChangedSet | undefined | ArchitectureError => {
  return change === undefined ? undefined : changedFiles(root, change);
};

const scopeOf = (result: CheckResult): ((file: string) => boolean) => {
  const selected = new Set(result.files.map((file) => file.relative));
  return (file) => result.complete && (!result.partial || selected.has(file));
};

const baseOf = (root: string, result: CheckResult, changed: ChangedSet | undefined): BaseState | undefined | ArchitectureError => {
  if (changed?.base === undefined) return undefined;
  return baseState(root, result.workspaces, { ...changed, base: changed.base });
};

const growthOf = (result: CheckResult, options: JudgeOptions, base: BaseState | undefined, recorded: Baseline): readonly BaselineEntry[] => {
  const isCi = options.ci === true && base !== undefined;
  return isCi ? unapprovedGrowth(result.workspaces, base, recorded) : [];
};

/** Compares a check's findings with the baseline: statuses, pruning (outside CI) and, in CI, growth against the base. */
export const judge = (root: string, result: CheckResult, options: JudgeOptions): Verdict | ArchitectureError => {
  const changed = changeOf(root, options.change);
  if (changed instanceof ArchitectureError) return changed;
  const recorded = readBaseline(root, result.workspaces);
  if (recorded instanceof ArchitectureError) return recorded;
  const hasBaseline = baselineExists(root, result.workspaces);
  const base = baseOf(root, result, changed);
  if (base instanceof ArchitectureError) return base;
  const judged = ratchet({
    findings: result.findings, baseline: recorded, adoption: result.architecture.adoption, inScope: scopeOf(result),
    ...(changed === undefined ? {} : { changed }),
    ...(base === undefined ? {} : { acceptedInChange: acceptedSince(base, recorded) }),
  });
  const isWriting = options.write && options.ci !== true && hasBaseline && result.complete;
  const written = isWriting ? writeBaseline(root, result.workspaces, judged.baseline) : [];
  if (written instanceof ArchitectureError) return written;
  const staged = options.change?.kind === "staged" ? stage(root, written) : "";
  if (staged instanceof ArchitectureError) return staged;
  return {
    result: withFindings(result, judged.findings), hasBaseline, stale: judged.stale, grown: growthOf(result, options, base, recorded), written,
    recorded: recordedTotal(judged.baseline),
    ...(base === undefined ? {} : { recordedAtBase: recordedTotal(base.baseline) }),
    ...(changed === undefined ? {} : { changed }),
  };
};

const isTouchedError = (finding: Finding): boolean => finding.status === "touched" && isBlocking(finding);

const isNewError = (finding: Finding): boolean => isBlocking(finding) && finding.status !== "touched";

/** A stale baseline fails only CI, which must not write the pruned file. */
const isStaleInCi = (verdict: Verdict, ci: boolean): boolean => ci && verdict.stale.length > 0;

/** Why the check fails, in order of precedence: new findings, touched files, unapproved growth, a stale baseline (CI). */
export const failureCodes = (verdict: Verdict, ci: boolean): readonly number[] => [
  ...(verdict.result.findings.some(isNewError) ? [EXIT_NEW] : []),
  ...(verdict.result.findings.some(isTouchedError) ? [EXIT_TOUCHED] : []),
  ...(verdict.grown.length > 0 ? [EXIT_GROWN] : []),
  ...(isStaleInCi(verdict, ci) ? [EXIT_STALE] : []),
];
