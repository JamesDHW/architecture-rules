import { rootWorkspace, workspaceOf } from "../analysis/workspaces.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { allOrError } from "../errors/results.js";
import { baselineOf, baselinePath, parseBaseline } from "./baselineFile.js";
import { fingerprintKey } from "./fingerprint.js";
import { showAt } from "./git.js";
const baseOf = (root, base, workspace) => {
    const text = showAt(root, base, baselinePath(workspace));
    if (text === undefined)
        return { workspace };
    const entries = parseBaseline(workspace, text, `${baselinePath(workspace)} at ${base.slice(0, 12)}`);
    return entries instanceof ArchitectureError ? entries : { workspace, entries };
};
/** Reads every workspace's baseline at the base commit. A file renamed in the change carries its debt to its new path. */
export const baseState = (root, workspaces, changed) => {
    const bases = allOrError([rootWorkspace, ...workspaces].map((workspace) => baseOf(root, changed.base, workspace)));
    if (bases instanceof ArchitectureError)
        return bases;
    const moved = bases.flatMap((entry) => entry.entries ?? []).map((entry) => ({ ...entry, file: changed.renames.get(entry.file) ?? entry.file }));
    return { baseline: baselineOf(moved), adopted: new Set(bases.filter((entry) => entry.entries === undefined).map((entry) => entry.workspace)) };
};
/** Growth needs a reason recorded in this change: a new one, or a different one from the base's. */
const isUnapprovedGrowth = (entry, before) => {
    const grew = entry.count > (before?.count ?? 0);
    const hasNewReason = entry.accepted !== undefined && entry.accepted !== before?.accepted;
    return grew && !hasNewReason;
};
/**
 * Entries that grew since the base commit without a reason recorded by the baseline command. A workspace with no
 * baseline at the base is being adopted, and may record anything.
 */
export const unapprovedGrowth = (workspaces, base, baseline) => {
    return [...baseline.values()].filter((entry) => {
        const isAdopting = base.adopted.has(workspaceOf(workspaces, entry.file));
        return !isAdopting && isUnapprovedGrowth(entry, base.baseline.get(fingerprintKey(entry)));
    });
};
/** Entries whose reason was recorded since the base: debt someone accepted within this change. */
export const acceptedSince = (base, baseline) => {
    const entries = [...baseline.values()].filter((entry) => entry.accepted !== undefined && entry.accepted !== base.baseline.get(fingerprintKey(entry))?.accepted);
    return new Set(entries.map(fingerprintKey));
};
/** How many violations a baseline records in all. */
export const recordedTotal = (baseline) => [...baseline.values()].reduce((total, entry) => total + entry.count, 0);
//# sourceMappingURL=growth.js.map