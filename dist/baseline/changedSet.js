import { ArchitectureError } from "../errors/architectureError.js";
import { git } from "./git.js";
/** A pure rename keeps every line: git scores it R100. */
const isPureRename = (status) => status === "R100";
/** One line of `git diff --name-status`: a status, then one path, or two for renames and copies. */
const parseLine = (line) => {
    const [status = "", path = "", destination = path] = line.split("\t");
    const hasTwoPaths = status.startsWith("R") || status.startsWith("C");
    if (!hasTwoPaths)
        return { touched: status.startsWith("D") ? [] : [path], renamed: [] };
    const renamed = status.startsWith("R") ? [[path, destination]] : [];
    return { touched: isPureRename(status) ? [] : [destination], renamed };
};
const parseNameStatus = (output) => {
    const changes = output.split("\n").filter((line) => line.length > 0).map(parseLine);
    return { touched: changes.flatMap((change) => change.touched), renamed: changes.flatMap((change) => change.renamed) };
};
const diff = (root, args) => {
    const output = git(root, ["-c", "core.quotePath=false", "diff", "--name-status", "--find-renames", "--relative", ...args]);
    return output instanceof ArchitectureError ? output : parseNameStatus(output);
};
const untracked = (root) => {
    const output = git(root, ["-c", "core.quotePath=false", "ls-files", "--others", "--exclude-standard"]);
    return output instanceof ArchitectureError ? output : output.split("\n").filter((path) => path.length > 0);
};
const changedSet = (change, extra, base) => ({
    files: new Set([...change.touched, ...extra]),
    renames: new Map(change.renamed),
    ...(base === undefined ? {} : { base }),
});
/** HEAD's commit, or undefined in a repository with no commits yet. */
const head = (root) => {
    const commit = git(root, ["rev-parse", "--verify", "--quiet", "HEAD"]);
    return commit instanceof ArchitectureError ? undefined : commit.trim();
};
const withUntracked = (root, change, base) => {
    if (change instanceof ArchitectureError)
        return change;
    const added = untracked(root);
    return added instanceof ArchitectureError ? added : changedSet(change, added, base);
};
const sinceRef = (root, ref) => {
    const base = git(root, ["merge-base", ref, "HEAD"]);
    if (base instanceof ArchitectureError)
        return new ArchitectureError([`--since ${ref}: no merge base with HEAD. ${base.message}`]);
    const commit = base.trim();
    return withUntracked(root, diff(root, [commit]), commit);
};
/** The files the change touches, from git. Outside a git repository this is an error. */
export const changedFiles = (root, source) => {
    const inside = git(root, ["rev-parse", "--is-inside-work-tree"]);
    if (inside instanceof ArchitectureError)
        return new ArchitectureError([`--${source.kind} needs a git repository: ${inside.message}`]);
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
//# sourceMappingURL=changedSet.js.map