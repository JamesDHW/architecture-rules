import { ArchitectureError } from "../errors/architectureError.js";
import { type Fingerprint } from "./fingerprint.js";
/** One recorded violation and how many times it occurs; accepted holds the reason someone allowed it to grow. */
export type BaselineEntry = Fingerprint & {
    readonly count: number;
    readonly accepted?: string;
};
/** Every recorded violation, by fingerprint key, with root-relative file paths. */
export type Baseline = ReadonlyMap<string, BaselineEntry>;
/** A workspace's baseline file, root-relative. */
export declare const baselinePath: (workspace: string) => string;
/** Parses one baseline file's text; a file that is not a baseline of this version is an error, never ignored. */
export declare const parseBaseline: (workspace: string, text: string, label: string) => readonly BaselineEntry[] | ArchitectureError;
export declare const baselineOf: (entries: readonly BaselineEntry[]) => Baseline;
/** The baseline files that exist, root-relative. */
export declare const existingBaselines: (root: string, workspaces: readonly string[]) => readonly string[];
/** Reads the root's and every workspace's baseline file into one baseline. */
export declare const readBaseline: (root: string, workspaces: readonly string[]) => Baseline | ArchitectureError;
/** One entry per line, sorted, so two changes to different files never touch the same lines. */
export declare const serializeBaseline: (workspace: string, entries: readonly BaselineEntry[]) => string;
/**
 * Writes the baseline back, one file per workspace that holds entries or already has a file. Returns the files that
 * changed, root-relative.
 */
export declare const writeBaseline: (root: string, workspaces: readonly string[], baseline: Baseline) => readonly string[] | ArchitectureError;
//# sourceMappingURL=baselineFile.d.ts.map