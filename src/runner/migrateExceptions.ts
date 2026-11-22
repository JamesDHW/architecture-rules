import { readFileSync, writeFileSync } from "node:fs";

import { inventory, type ClassifiedFile } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import { exceptionMigrations, type SourceEdit } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";

const isGenerated = (file: ClassifiedFile): boolean => file.policy.generated !== undefined;

/** Applies non-overlapping edits to one file: the untouched text between them, with each edit's replacement. */
const applyEdits = (path: string, edits: readonly SourceEdit[]): void => {
  const text = readFileSync(path, "utf8");
  const sorted = edits.toSorted((left, right) => left.start - right.start);
  const previousEnd = (index: number): number => (index === 0 ? 0 : sorted.at(index - 1)?.end ?? 0);
  const pieces = sorted.flatMap((edit, index) => [text.slice(previousEnd(index), edit.start), edit.replacement]);
  writeFileSync(path, [...pieces, text.slice(sorted.at(-1)?.end ?? 0)].join(""));
};

/** --fix converts reasoned engine disable comments into exceptions before anything else is checked. */
export const migrateExceptions = async (root: string, architecture: Architecture, opened: Projects): Promise<number> => {
  const tree = inventory(root, architecture, opened.sources);
  const edits = exceptionMigrations(tree.files.filter((file) => !isGenerated(file)), opened.projects);
  for (const [path, fileEdits] of Map.groupBy(edits, (edit) => edit.path)) {
    applyEdits(path, fileEdits);
  }
  return edits.length;
};

