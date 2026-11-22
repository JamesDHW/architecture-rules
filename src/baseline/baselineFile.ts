import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { posix } from "../analysis/paths.js";
import { rootWorkspace, workspaceOf } from "../analysis/workspaces.js";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { allOrError } from "../errors/results.js";
import { tryCatch } from "../errors/tryCatch.js";
import { BASELINE_FILE_NAME, BASELINE_VERSION } from "./baseline.constants.js";
import { fingerprintKey, type Fingerprint } from "./fingerprint.js";

/** One recorded violation and how many times it occurs; accepted holds the reason someone allowed it to grow. */
export type BaselineEntry = Fingerprint & { readonly count: number; readonly accepted?: string };

/** Every recorded violation, by fingerprint key, with root-relative file paths. */
export type Baseline = ReadonlyMap<string, BaselineEntry>;

/** A workspace's baseline file, root-relative. */
export const baselinePath = (workspace: string): string => (workspace === rootWorkspace ? BASELINE_FILE_NAME : `${workspace}/${BASELINE_FILE_NAME}`);

const rootRelative = (workspace: string, file: string): string => (workspace === rootWorkspace ? file : `${workspace}/${file}`);

const workspaceRelative = (workspace: string, file: string): string => (workspace === rootWorkspace ? file : file.slice(workspace.length + 1));

const isCount = (value: unknown): value is number => Number.isInteger(value) && typeof value === "number" && value > 0;

const entryOf = (workspace: string, value: unknown): BaselineEntry | undefined => {
  if (!isRecord(value)) return undefined;
  const { file, rule, message, count, accepted } = value;
  const isEntry = isString(file) && isString(rule) && isString(message) && isCount(count);
  if (!isEntry) return undefined;
  const reason = isString(accepted) ? { accepted } : {};
  return { file: rootRelative(workspace, posix(file)), rule, message, count, ...reason };
};

/** Parses one baseline file's text; a file that is not a baseline of this version is an error, never ignored. */
export const parseBaseline = (workspace: string, text: string, label: string): readonly BaselineEntry[] | ArchitectureError => {
  const parsed = tryCatch((): unknown => JSON.parse(text));
  if (parsed instanceof ArchitectureError) return new ArchitectureError([`${label} is not valid JSON: ${parsed.message}`]);
  const isCurrentVersion = isRecord(parsed) && parsed.version === BASELINE_VERSION && isUnknownArray(parsed.entries);
  if (!isCurrentVersion) return new ArchitectureError([`${label} is not a version ${BASELINE_VERSION} architecture baseline`]);
  const entries = isUnknownArray(parsed.entries) ? parsed.entries : [];
  const read = entries.map((entry) => entryOf(workspace, entry));
  const invalid = read.filter((entry) => entry === undefined).length;
  if (invalid > 0) return new ArchitectureError([`${label} has ${invalid} invalid entries: each needs file, rule, message and a positive count`]);
  return read.filter((entry): entry is BaselineEntry => entry !== undefined);
};

export const baselineOf = (entries: readonly BaselineEntry[]): Baseline => new Map(entries.map((entry) => [fingerprintKey(entry), entry]));

const readWorkspace = (root: string, workspace: string): readonly BaselineEntry[] | ArchitectureError => {
  const path = join(root, baselinePath(workspace));
  if (!existsSync(path)) return [];
  const text = tryCatch(() => readFileSync(path, "utf8"));
  return text instanceof ArchitectureError ? text : parseBaseline(workspace, text, baselinePath(workspace));
};

/** The baseline files that exist, root-relative. */
export const existingBaselines = (root: string, workspaces: readonly string[]): readonly string[] => {
  return [rootWorkspace, ...workspaces].map(baselinePath).filter((path) => existsSync(join(root, path)));
};

/** Reads the root's and every workspace's baseline file into one baseline. */
export const readBaseline = (root: string, workspaces: readonly string[]): Baseline | ArchitectureError => {
  const read = allOrError([rootWorkspace, ...workspaces].map((workspace) => readWorkspace(root, workspace)));
  return read instanceof ArchitectureError ? read : baselineOf(read.flat());
};

const entryOrder = (left: BaselineEntry, right: BaselineEntry): number => fingerprintKey(left).localeCompare(fingerprintKey(right));

const entryLine = (workspace: string, entry: BaselineEntry): string => {
  const reason = entry.accepted === undefined ? {} : { accepted: entry.accepted };
  return `    ${JSON.stringify({ file: workspaceRelative(workspace, entry.file), rule: entry.rule, count: entry.count, message: entry.message, ...reason })}`;
};

/** One entry per line, sorted, so two changes to different files never touch the same lines. */
export const serializeBaseline = (workspace: string, entries: readonly BaselineEntry[]): string => {
  const lines = entries.toSorted(entryOrder).map((entry) => entryLine(workspace, entry));
  const body = lines.length === 0 ? "[]" : `[\n${lines.join(",\n")}\n  ]`;
  return `{\n  "version": ${BASELINE_VERSION},\n  "entries": ${body}\n}\n`;
};

const writeIfChanged = (root: string, workspace: string, text: string): readonly string[] => {
  const path = join(root, baselinePath(workspace));
  const current = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  if (current === text) return [];
  writeFileSync(path, text);
  return [baselinePath(workspace)];
};

const isWritten = (root: string, workspace: string, entries: readonly BaselineEntry[] | undefined): boolean => {
  return entries !== undefined || existsSync(join(root, baselinePath(workspace)));
};

/**
 * Writes the baseline back, one file per workspace that holds entries or already has a file. Returns the files that
 * changed, root-relative.
 */
export const writeBaseline = (root: string, workspaces: readonly string[], baseline: Baseline): readonly string[] | ArchitectureError => {
  const byWorkspace = Map.groupBy(baseline.values(), (entry) => workspaceOf(workspaces, entry.file));
  const targets = [rootWorkspace, ...workspaces].filter((workspace) => isWritten(root, workspace, byWorkspace.get(workspace)));
  const written = tryCatch(() => targets.flatMap((workspace) => writeIfChanged(root, workspace, serializeBaseline(workspace, byWorkspace.get(workspace) ?? []))));
  return written;
};
