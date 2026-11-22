import { rootWorkspace, workspaceOf } from "../analysis/workspaces.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { allOrError } from "../errors/results.js";
import { baselineOf, baselinePath, parseBaseline, type Baseline, type BaselineEntry } from "./baselineFile.js";
import type { ChangedSet } from "./changedSet.js";
import { fingerprintKey } from "./fingerprint.js";
import { showAt } from "./git.js";

/** A workspace's baseline at the base commit; no entries when it had none there, which makes this its first baseline. */
type BaseBaseline = { readonly workspace: string; readonly entries?: readonly BaselineEntry[] };

/** The baseline at the change's base commit, under today's paths, and the workspaces that had none there. */
export type BaseState = { readonly baseline: Baseline; readonly adopted: ReadonlySet<string> };

const baseOf = (root: string, base: string, workspace: string): BaseBaseline | ArchitectureError => {
  const text = showAt(root, base, baselinePath(workspace));
  if (text === undefined) return { workspace };
  const entries = parseBaseline(workspace, text, `${baselinePath(workspace)} at ${base.slice(0, 12)}`);
  return entries instanceof ArchitectureError ? entries : { workspace, entries };
};

/** Reads every workspace's baseline at the base commit. A file renamed in the change carries its debt to its new path. */
export const baseState = (root: string, workspaces: readonly string[], changed: ChangedSet & { readonly base: string }): BaseState | ArchitectureError => {
  const bases = allOrError([rootWorkspace, ...workspaces].map((workspace) => baseOf(root, changed.base, workspace)));
  if (bases instanceof ArchitectureError) return bases;
  const moved = bases.flatMap((entry) => entry.entries ?? []).map((entry) => ({ ...entry, file: changed.renames.get(entry.file) ?? entry.file }));
  return { baseline: baselineOf(moved), adopted: new Set(bases.filter((entry) => entry.entries === undefined).map((entry) => entry.workspace)) };
};

/** Growth needs a reason recorded in this change: a new one, or a different one from the base's. */
const isUnapprovedGrowth = (entry: BaselineEntry, before: BaselineEntry | undefined): boolean => {
  const grew = entry.count > (before?.count ?? 0);
  const hasNewReason = entry.accepted !== undefined && entry.accepted !== before?.accepted;
  return grew && !hasNewReason;
};

/**
 * Entries that grew since the base commit without a reason recorded by the baseline command. A workspace with no
 * baseline at the base is being adopted, and may record anything.
 */
export const unapprovedGrowth = (workspaces: readonly string[], base: BaseState, baseline: Baseline): readonly BaselineEntry[] => {
  return [...baseline.values()].filter((entry) => {
    const isAdopting = base.adopted.has(workspaceOf(workspaces, entry.file));
    return !isAdopting && isUnapprovedGrowth(entry, base.baseline.get(fingerprintKey(entry)));
  });
};

/** Entries whose reason was recorded since the base: debt someone accepted within this change. */
export const acceptedSince = (base: BaseState, baseline: Baseline): ReadonlySet<string> => {
  const entries = [...baseline.values()].filter((entry) => entry.accepted !== undefined && entry.accepted !== base.baseline.get(fingerprintKey(entry))?.accepted);
  return new Set(entries.map(fingerprintKey));
};

/** How many violations a baseline records in all. */
export const recordedTotal = (baseline: Baseline): number => [...baseline.values()].reduce((total, entry) => total + entry.count, 0);
