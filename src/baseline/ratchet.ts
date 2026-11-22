import { touchPolicyFor } from "../config/adoption.js";
import type { Adoption } from "../config/types.js";
import type { Finding, FindingStatus } from "../runner/findings.js";
import { baselineOf, type Baseline, type BaselineEntry } from "./baselineFile.js";
import type { ChangedSet } from "./changedSet.js";
import { fingerprintKey, fingerprintOf, isBaselineable } from "./fingerprint.js";

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

const noRenames: ReadonlyMap<string, string> = new Map();

/** Recorded debt follows a renamed file to its new path. */
const renamed = (baseline: Baseline, changed: ChangedSet | undefined): Baseline => {
  const renames = changed?.renames ?? noRenames;
  if (renames.size === 0) return baseline;
  const moved = [...baseline.values()].map((entry) => ({ ...entry, file: renames.get(entry.file) ?? entry.file }));
  const merged = [...Map.groupBy(moved, fingerprintKey).values()].map((group) => {
    const [first] = group;
    return first === undefined ? [] : [{ ...first, count: group.reduce((total, entry) => total + entry.count, 0) }];
  });
  return baselineOf(merged.flat());
};

/** How many times each fingerprint occurs among the baselineable findings. */
const foundCounts = (findings: readonly Finding[]): ReadonlyMap<string, number> => {
  const keys = findings.filter(isBaselineable).map((finding) => fingerprintKey(fingerprintOf(finding)));
  return new Map([...Map.groupBy(keys, (key) => key)].map(([key, group]) => [key, group.length]));
};

const isTouched = (input: RatchetInput, finding: Finding): boolean => {
  const isChangedFile = input.changed?.files.has(finding.file) ?? false;
  const isAcceptedNow = input.acceptedInChange?.has(fingerprintKey(fingerprintOf(finding))) ?? false;
  return isChangedFile && !isAcceptedNow && touchPolicyFor(input.adoption, finding.ruleId) === "fix";
};

const recordedStatus = (input: RatchetInput, finding: Finding): FindingStatus => (isTouched(input, finding) ? "touched" : "baselined");

/** A fingerprint found more often than recorded: every occurrence is new, since none can be told apart. */
const grownMessage = (finding: Finding, recorded: number, found: number): string => {
  return recorded === 0 ? finding.message : `${finding.message} (recorded ${recorded} times in this file, now ${found})`;
};

const withStatus = (input: RatchetInput, baseline: Baseline, found: ReadonlyMap<string, number>) => (finding: Finding): Finding => {
  if (!isBaselineable(finding)) return finding;
  const key = fingerprintKey(fingerprintOf(finding));
  const recorded = baseline.get(key)?.count ?? 0;
  const count = found.get(key) ?? 0;
  if (count > recorded) return { ...finding, status: "new", message: grownMessage(finding, recorded, count) };
  return { ...finding, status: recordedStatus(input, finding) };
};

const pruned = (baseline: Baseline, found: ReadonlyMap<string, number>, inScope: (file: string) => boolean): readonly BaselineEntry[] => {
  return [...baseline.values()].flatMap((entry) => {
    if (!inScope(entry.file)) return [entry];
    const count = Math.min(entry.count, found.get(fingerprintKey(entry)) ?? 0);
    return count === 0 ? [] : [{ ...entry, count }];
  });
};

/** Compares findings with the baseline: statuses for the findings, and the baseline with fixed debt removed. */
export const ratchet = (input: RatchetInput): Ratchet => {
  const baseline = renamed(input.baseline, input.changed);
  const found = foundCounts(input.findings);
  const next = baselineOf(pruned(baseline, found, input.inScope));
  const stale = [...baseline.values()].filter((entry) => input.inScope(entry.file) && (found.get(fingerprintKey(entry)) ?? 0) < entry.count);
  return { findings: input.findings.map(withStatus(input, baseline, found)), baseline: next, stale };
};

/** What the baseline command records, and which findings it accepted beyond what was recorded. */
export type Accepted = { readonly baseline: Baseline; readonly added: readonly BaselineEntry[] };

type AcceptInput = {
  readonly findings: readonly Finding[];
  readonly baseline: Baseline;
  readonly inScope: (file: string) => boolean;
  /** Only findings of these rules are added; every rule when absent. */
  readonly rules?: ReadonlySet<string>;
  /** The reason recorded on each entry that grows; none when the baseline is first created. */
  readonly reason?: string;
};

const isAccepted = (input: AcceptInput, finding: Finding): boolean => {
  return isBaselineable(finding) && (input.rules === undefined || input.rules.has(finding.ruleId));
};

const acceptedEntry = (input: AcceptInput, recorded: BaselineEntry | undefined, entry: BaselineEntry): BaselineEntry => {
  const isGrowth = entry.count > (recorded?.count ?? 0);
  const isReasonedGrowth = isGrowth && input.reason !== undefined;
  const reason = isReasonedGrowth ? { accepted: input.reason } : {};
  const kept = recorded?.accepted === undefined ? {} : { accepted: recorded.accepted };
  return { ...entry, ...kept, ...reason };
};

/**
 * Records the findings as debt: the accepted ones at the count found now, with the reason on every entry that grew;
 * everything else is pruned as a check would.
 */
export const accept = (input: AcceptInput): Accepted => {
  const found = foundCounts(input.findings);
  const kept = baselineOf(pruned(input.baseline, found, input.inScope));
  const findingsByKey = Map.groupBy(input.findings.filter((finding) => isAccepted(input, finding)), (finding) => fingerprintKey(fingerprintOf(finding)));
  const recordedNow = [...findingsByKey.values()].flatMap((group) => {
    const [first] = group;
    if (first === undefined) return [];
    const entry: BaselineEntry = { ...fingerprintOf(first), count: group.length };
    return [acceptedEntry(input, input.baseline.get(fingerprintKey(entry)), entry)];
  });
  const added = recordedNow.filter((entry) => entry.count > (input.baseline.get(fingerprintKey(entry))?.count ?? 0));
  return { baseline: new Map([...kept, ...baselineOf(recordedNow)]), added };
};
