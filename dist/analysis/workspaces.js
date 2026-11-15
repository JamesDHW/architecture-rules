import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { tryCatch } from "../errors/tryCatch.js";
import { matches, posix } from "./paths.js";
/** The root's own package. */
export const rootWorkspace = ".";
const readText = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");
/** The packages list of pnpm-workspace.yaml: the indented "- pattern" lines under packages:. */
const pnpmPatterns = (root) => {
    const lines = readText(join(root, "pnpm-workspace.yaml")).split("\n");
    const start = lines.findIndex((line) => /^packages\s*:/.test(line));
    if (start === -1)
        return [];
    const following = lines.slice(start + 1);
    const end = following.findIndex((line) => /^\S/.test(line));
    return (end === -1 ? following : following.slice(0, end))
        .map((line) => /^\s+-\s*["']?([^"'#]+?)["']?\s*(?:#.*)?$/.exec(line)?.[1])
        .filter(isString);
};
/** package.json's workspaces: a list, or an object with a packages list. */
const manifestPatterns = (root) => {
    const parsed = tryCatch(() => JSON.parse(readText(join(root, "package.json"))));
    if (!isRecord(parsed))
        return [];
    const { workspaces } = parsed;
    const list = isRecord(workspaces) ? workspaces.packages : workspaces;
    return isUnknownArray(list) ? list.filter(isString) : [];
};
const ancestors = (relative) => {
    const parts = posix(relative).split("/").slice(0, -1);
    return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
};
/**
 * The workspace packages that hold the files, as root-relative directories, longest first. A directory is a
 * workspace when the root's workspace patterns select it and it has a package.json.
 */
export const workspacesOf = (root, files) => {
    const patterns = [...pnpmPatterns(root), ...manifestPatterns(root)];
    const included = patterns.filter((pattern) => !pattern.startsWith("!"));
    const excluded = patterns.filter((pattern) => pattern.startsWith("!")).map((pattern) => pattern.slice(1));
    const candidates = [...new Set(files.flatMap((file) => ancestors(file.relative)))];
    const isWorkspace = (directory) => {
        const isSelected = matches(directory, included) && !matches(directory, excluded);
        return isSelected && existsSync(join(root, directory, "package.json"));
    };
    return candidates.filter(isWorkspace).toSorted((left, right) => right.length - left.length);
};
/** The workspace a root-relative path belongs to: the deepest workspace directory containing it, or the root. */
export const workspaceOf = (workspaces, relative) => {
    return workspaces.find((directory) => relative.startsWith(`${directory}/`)) ?? rootWorkspace;
};
//# sourceMappingURL=workspaces.js.map