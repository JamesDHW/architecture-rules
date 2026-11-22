import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CACHE_VERSION, LOCKFILES } from "./checkCache.constants.js";
const hash = (parts) => createHash("sha256").update(parts.join("\0")).digest("hex");
const readIfPresent = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");
/** The checker's own build: rebuilding it changes the findings it may report. */
const toolStamp = () => {
    const here = fileURLToPath(import.meta.url);
    return String(statSync(here).mtimeMs);
};
/** Every file each file imports, directly or not: the types it sees come from them. */
const closures = (files, imports) => {
    const edges = [...imports.links.map((link) => [link.from, link.to]), ...imports.issues.flatMap((issue) => (issue.target === undefined ? [] : [[issue.file, issue.target.file]]))];
    const outgoing = new Map([...Map.groupBy(edges, ([from]) => from)].map(([from, group]) => [from, group.map(([, to]) => to)]));
    const reach = (pending, seen) => {
        const next = pending.flatMap((file) => outgoing.get(file) ?? []).filter((file) => !seen.has(file));
        if (next.length === 0)
            return seen;
        const unique = [...new Set(next)];
        return reach(unique, new Set([...seen, ...unique]));
    };
    const known = new Set(files.map((file) => file.relative));
    return (file) => [...reach([file], new Set([file]))].filter((path) => known.has(path)).toSorted();
};
/**
 * Keys for the analysis cache. Declaration files and lockfiles go into every key: an ambient type or a package
 * upgrade changes findings in files that import neither.
 */
export const cacheKeys = (root, architecture, opened, files, imports, workspaces) => {
    const texts = new Map(files.map((file) => [file.relative, readFileSync(file.path, "utf8")]));
    const contents = new Map([...texts].map(([path, text]) => [path, hash([text])]));
    const globalDeclarations = [...texts].filter(([, text]) => /\bdeclare\s+global\b/.test(text)).map(([path]) => `${path}:${contents.get(path) ?? ""}`);
    const manifests = [".", ...workspaces].map((directory) => readIfPresent(join(root, directory, "package.json")));
    const declarations = files.filter((file) => /\.d\.[cm]?ts$/.test(file.relative)).map((file) => `${file.relative}:${contents.get(file.relative) ?? ""}`);
    const global = hash([
        String(CACHE_VERSION), toolStamp(), JSON.stringify(architecture), JSON.stringify([...opened.compilerOptions]),
        ...manifests, ...LOCKFILES.map((name) => readIfPresent(join(root, name))), ...declarations,
    ]);
    const closureOf = closures(files, imports);
    const issuesByFile = Map.groupBy(imports.issues, (issue) => issue.file);
    const fileKey = (file) => hash([
        global, file.layer, JSON.stringify(issuesByFile.get(file.relative) ?? []),
        ...closureOf(file.relative).map((path) => `${path}:${contents.get(path) ?? ""}`),
    ]);
    const programKey = hash([global, ...files.map((file) => `${file.relative}:${contents.get(file.relative) ?? ""}`)]);
    return { fileKey, programKey, globalScopeKey: hash([global, ...globalDeclarations]) };
};
//# sourceMappingURL=cacheKeys.js.map