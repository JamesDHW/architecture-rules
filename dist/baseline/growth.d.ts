import { ArchitectureError } from "../errors/architectureError.js";
import { type Baseline, type BaselineEntry } from "./baselineFile.js";
import type { ChangedSet } from "./changedSet.js";
/** The baseline at the change's base commit, under today's paths, and the workspaces that had none there. */
export type BaseState = {
    readonly baseline: Baseline;
    readonly adopted: ReadonlySet<string>;
};
/** Reads every workspace's baseline at the base commit. A file renamed in the change carries its debt to its new path. */
export declare const baseState: (root: string, workspaces: readonly string[], changed: ChangedSet & {
    readonly base: string;
}) => BaseState | ArchitectureError;
/**
 * Entries that grew since the base commit without a reason recorded by the baseline command. A workspace with no
 * baseline at the base is being adopted, and may record anything.
 */
export declare const unapprovedGrowth: (workspaces: readonly string[], base: BaseState, baseline: Baseline) => readonly BaselineEntry[];
/** Entries whose reason was recorded since the base: debt someone accepted within this change. */
export declare const acceptedSince: (base: BaseState, baseline: Baseline) => ReadonlySet<string>;
/** How many violations a baseline records in all. */
export declare const recordedTotal: (baseline: Baseline) => number;
//# sourceMappingURL=growth.d.ts.map