import type { Adoption } from "../config/types.js";
import type { Finding } from "../runner/findings.js";
import { type Baseline, type BaselineEntry } from "./baselineFile.js";
import type { ChangedSet } from "./changedSet.js";
export type RatchetInput = {
    readonly findings: readonly Finding[];
    readonly baseline: Baseline;
    readonly adoption: Adoption;
    /** The change being judged; without one, no file counts as touched. */
    readonly changed?: ChangedSet;
    /** Whether a root-relative file's findings were collected; entries of other files are never pruned. */
    readonly inScope: (file: string) => boolean;
    /** Fingerprint keys whose growth was accepted, with a reason, within the change: they do not fail as touched. */
    readonly acceptedInChange?: ReadonlySet<string>;
};
export type Ratchet = {
    /** Every finding, each baselineable one with its status. */
    readonly findings: readonly Finding[];
    /** The baseline with renames applied and fixed debt removed. It never grows. */
    readonly baseline: Baseline;
    /** Entries recorded more often than they now occur: fixed debt the baseline file still lists. */
    readonly stale: readonly BaselineEntry[];
};
/** Compares findings with the baseline: statuses for the findings, and the baseline with fixed debt removed. */
export declare const ratchet: (input: RatchetInput) => Ratchet;
/** What the baseline command records, and which findings it accepted beyond what was recorded. */
export type Accepted = {
    readonly baseline: Baseline;
    readonly added: readonly BaselineEntry[];
};
type AcceptInput = {
    readonly findings: readonly Finding[];
    readonly baseline: Baseline;
    readonly inScope: (file: string) => boolean;
    /** Only findings of these rules are added; every rule when absent. */
    readonly rules?: ReadonlySet<string>;
    /** The reason recorded on each entry that grows; none when the baseline is first created. */
    readonly reason?: string;
};
/**
 * Records the findings as debt: the accepted ones at the count found now, with the reason on every entry that grew;
 * everything else is pruned as a check would.
 */
export declare const accept: (input: AcceptInput) => Accepted;
export {};
//# sourceMappingURL=ratchet.d.ts.map