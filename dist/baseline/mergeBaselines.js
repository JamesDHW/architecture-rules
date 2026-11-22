import { readFileSync, writeFileSync } from "node:fs";
import { rootWorkspace } from "../analysis/workspaces.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { allOrError } from "../errors/results.js";
import { tryCatch } from "../errors/tryCatch.js";
import { baselineOf, parseBaseline, serializeBaseline } from "./baselineFile.js";
const countIn = (baseline, key) => baseline.get(key)?.count ?? 0;
/**
 * A three-way merge of one baseline file: each side's change in count is applied to the ancestor's, so one branch's
 * fix and another's accepted growth both survive. It never conflicts; the next check prunes anything stale.
 */
const mergeBaselines = (ancestor, current, other) => {
    const keys = [...new Set([...ancestor.keys(), ...current.keys(), ...other.keys()])];
    return keys.flatMap((key) => {
        const count = countIn(current, key) + countIn(other, key) - countIn(ancestor, key);
        const entry = current.get(key) ?? other.get(key) ?? ancestor.get(key);
        const isGone = entry === undefined || count <= 0;
        if (isGone)
            return [];
        const accepted = current.get(key)?.accepted ?? other.get(key)?.accepted;
        return [{ file: entry.file, rule: entry.rule, message: entry.message, count, ...(accepted === undefined ? {} : { accepted }) }];
    });
};
const readFile = (path) => {
    const text = tryCatch(() => readFileSync(path, "utf8"));
    if (text instanceof ArchitectureError)
        return text;
    const entries = text.trim().length === 0 ? [] : parseBaseline(rootWorkspace, text, path);
    return entries instanceof ArchitectureError ? entries : baselineOf(entries);
};
/** git's merge driver: merges the three versions and writes the result over the current one, as git expects. */
export const mergeBaselineFiles = (ancestorPath, currentPath, otherPath) => {
    const read = allOrError([ancestorPath, currentPath, otherPath].map(readFile));
    if (read instanceof ArchitectureError)
        return read;
    const [ancestor = new Map(), current = new Map(), other = new Map()] = read;
    const written = tryCatch(() => {
        writeFileSync(currentPath, serializeBaseline(rootWorkspace, mergeBaselines(ancestor, current, other)));
    });
    return written instanceof ArchitectureError ? written : 0;
};
//# sourceMappingURL=mergeBaselines.js.map