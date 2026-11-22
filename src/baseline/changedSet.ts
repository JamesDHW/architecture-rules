import { ArchitectureError } from "../errors/architectureError.js";
import { git } from "./git.js";

/** Which change a check judges: the staged files, the working tree against HEAD, or everything since a ref's merge base. */
export type ChangeSource = { readonly kind: "staged" } | { readonly kind: "worktree" } | { readonly kind: "since"; readonly ref: string };

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

type Change = { readonly touched: readonly string[]; readonly renamed: readonly (readonly [string, string])[] };

/** A pure rename keeps every line: git scores it R100. */
const isPureRename = (status: string): boolean => status === "R100";

/** One line of `git diff --name-status`: a status, then one path, or two for renames and copies. */
const parseLine = (line: string): Change => {
  const [status = "", path = "", destination = path] = line.split("\t");
  const hasTwoPaths = status.startsWith("R") || status.startsWith("C");
  if (!hasTwoPaths) return { touched: status.startsWith("D") ? [] : [path], renamed: [] };
  const renamed = status.startsWith("R") ? [[path, destination] as const] : [];
  return { touched: isPureRename(status) ? [] : [destination], renamed };
};

const parseNameStatus = (output: string): Change => {
  const changes = output.split("\n").filter((line) => line.length > 0).map(parseLine);
  return { touched: changes.flatMap((change) => change.touched), renamed: changes.flatMap((change) => change.renamed) };
};

const diff = (root: string, args: readonly string[]): Change | ArchitectureError => {
  const output = git(root, ["-c", "core.quotePath=false", "diff", "--name-status", "--find-renames", "--relative", ...args]);
  return output instanceof ArchitectureError ? output : parseNameStatus(output);
};

const untracked = (root: string): readonly string[] | ArchitectureError => {
  const output = git(root, ["-c", "core.quotePath=false", "ls-files", "--others", "--exclude-standard"]);
  return output instanceof ArchitectureError ? output : output.split("\n").filter((path) => path.length > 0);
};

const changedSet = (change: Change, extra: readonly string[], base?: string): ChangedSet => ({
  files: new Set([...change.touched, ...extra]),
  renames: new Map(change.renamed),
  ...(base === undefined ? {} : { base }),
});

/** HEAD's commit, or undefined in a repository with no commits yet. */
const head = (root: string): string | undefined => {
  const commit = git(root, ["rev-parse", "--verify", "--quiet", "HEAD"]);
  return commit instanceof ArchitectureError ? undefined : commit.trim();
};

const withUntracked = (root: string, change: Change | ArchitectureError, base: string | undefined): ChangedSet | ArchitectureError => {
  if (change instanceof ArchitectureError) return change;
  const added = untracked(root);
  return added instanceof ArchitectureError ? added : changedSet(change, added, base);
};

const sinceRef = (root: string, ref: string): ChangedSet | ArchitectureError => {
  const base = git(root, ["merge-base", ref, "HEAD"]);
  if (base instanceof ArchitectureError) return new ArchitectureError([`--since ${ref}: no merge base with HEAD. ${base.message}`]);
  const commit = base.trim();
  return withUntracked(root, diff(root, [commit]), commit);
};

/** The files the change touches, from git. Outside a git repository this is an error. */
export const changedFiles = (root: string, source: ChangeSource): ChangedSet | ArchitectureError => {
  const inside = git(root, ["rev-parse", "--is-inside-work-tree"]);
  if (inside instanceof ArchitectureError) return new ArchitectureError([`--${source.kind} needs a git repository: ${inside.message}`]);
  switch (source.kind) {
    case "staged": {
      const staged = diff(root, ["--cached"]);
      return staged instanceof ArchitectureError ? staged : changedSet(staged, [], head(root));
    }
    case "worktree": {
      const commit = head(root);
      return withUntracked(root, commit === undefined ? { touched: [], renamed: [] } : diff(root, ["HEAD"]), commit);
    }
    case "since":
      return sinceRef(root, source.ref);
  }
};
