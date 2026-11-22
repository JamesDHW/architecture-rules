import { readFileSync, writeFileSync } from "node:fs";
import { inventory } from "../analysis/inventory.js";
import { exceptionMigrations } from "../analysis/suppressions.js";
const isGenerated = (file) => file.policy.generated !== undefined;
/** Applies non-overlapping edits to one file: the untouched text between them, with each edit's replacement. */
const applyEdits = (path, edits) => {
    const text = readFileSync(path, "utf8");
    const sorted = edits.toSorted((left, right) => left.start - right.start);
    const previousEnd = (index) => (index === 0 ? 0 : sorted.at(index - 1)?.end ?? 0);
    const pieces = sorted.flatMap((edit, index) => [text.slice(previousEnd(index), edit.start), edit.replacement]);
    writeFileSync(path, [...pieces, text.slice(sorted.at(-1)?.end ?? 0)].join(""));
};
/** --fix converts reasoned engine disable comments into exceptions before anything else is checked. */
export const migrateExceptions = async (root, architecture, opened) => {
    const tree = inventory(root, architecture, opened.sources);
    const edits = exceptionMigrations(tree.files.filter((file) => !isGenerated(file)), opened.projects);
    for (const [path, fileEdits] of Map.groupBy(edits, (edit) => edit.path)) {
        applyEdits(path, fileEdits);
    }
    return edits.length;
};
//# sourceMappingURL=migrateExceptions.js.map