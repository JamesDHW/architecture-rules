import { ArchitectureError } from "../errors/architectureError.js";
/** Which change a check judges: the staged files, the working tree against HEAD, or everything since a ref's merge base. */
export type ChangeSource = {
    readonly kind: "staged";
} | {
    readonly kind: "worktree";
} | {
    readonly kind: "since";
    readonly ref: string;
};
/**
 * The files a change touches, root-relative. A pure rename (content unchanged) is not a touch: moving a file to the
 * right folder must not force fixing all its other debt at once. renames maps each old path to its new one, so
 * recorded debt follows the file.
 */
export type ChangedSet = {
    readonly files: ReadonlySet<string>;
    readonly renames: ReadonlyMap<string, string>;
    /** The commit the change is measured from: the merge base for --since, HEAD otherwise (absent before the first commit). */
    readonly base?: string;
};
/** The files the change touches, from git. Outside a git repository this is an error. */
export declare const changedFiles: (root: string, source: ChangeSource) => ChangedSet | ArchitectureError;
//# sourceMappingURL=changedSet.d.ts.map