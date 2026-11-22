import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, join, posix } from "node:path";

import type { ClassifiedFile } from "../analysis/inventory.js";
import { classify } from "../analysis/inventory.js";
import { git } from "../baseline/git.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
import type { CheckResult } from "../runner/checkResult.js";
import { compliantName } from "../rules/namingPolicy.js";
import { applyTextEdits, literals, resolveRelative, type TextEdit } from "./specifiers.js";

/** A file to rename, and why another one could not be. */
export type Rename = { readonly from: string; readonly to: string };
type Skipped = { readonly file: string; readonly reason: string };
export type RenamePlan = { readonly renames: readonly Rename[]; readonly skipped: readonly Skipped[] };

const stemOf = (name: string): string => name.replace(/(?:\.d)?\.[cm]?[jt]sx?$/i, "");

const planOne = (result: CheckResult, file: ClassifiedFile): Rename | Skipped => {
  const naming = file.policy.naming;
  const name = naming === undefined ? undefined : compliantName(file.relative, naming);
  if (name === undefined) return { file: file.relative, reason: "a case change cannot fix it: choose the name (prefix or required suffix)" };
  const to = posix.join(posix.dirname(file.relative), name);
  const layers = classify(result.architecture, to);
  const staysInLayer = layers.length === 1 && layers.at(0) === file.layer;
  if (!staysInLayer) return { file: file.relative, reason: `${to} would not belong to layer ${file.layer}` };
  return { from: file.relative, to };
};

const isRename = (entry: Rename | Skipped): entry is Rename => "to" in entry;

/** Plans a rename for every file with a file-naming finding that a case change fixes. */
export const planRenames = (result: CheckResult, inScope: (file: string) => boolean): RenamePlan => {
  const named = new Set(result.findings.filter((finding) => finding.ruleId === "file-naming" && inScope(finding.file)).map((finding) => finding.file));
  const plans = result.files.filter((file) => named.has(file.relative)).map((file) => planOne(result, file));
  const targets = Map.groupBy(plans.filter(isRename), (rename) => rename.to.toLowerCase());
  const collides = (rename: Rename): boolean => (targets.get(rename.to.toLowerCase())?.length ?? 0) > 1;
  return {
    renames: plans.filter(isRename).filter((rename) => !collides(rename)),
    skipped: [...plans.filter((plan): plan is Skipped => !isRename(plan)), ...plans.filter(isRename).filter(collides).map((rename) => ({ file: rename.from, reason: `another file would also become ${rename.to}` }))],
  };
};

/** The importers of a file, from the import analysis: allowed and denied imports alike. */
const importersOf = (result: CheckResult, file: string): readonly string[] => {
  const allowed = (result.imports?.links ?? []).filter((link) => link.to === file).map((link) => link.from);
  const denied = (result.imports?.issues ?? []).filter((issue) => issue.target?.file === file).map((issue) => issue.file);
  return [...new Set([...allowed, ...denied])];
};

/** Rewrites the last path segment of a specifier that names the old file, keeping any extension it spells. */
const renamedSpecifier = (specifier: string, rename: Rename): string | undefined => {
  const oldStem = stemOf(basename(rename.from));
  const newStem = stemOf(basename(rename.to));
  const segments = specifier.split("/");
  const last = segments.at(-1) ?? "";
  const rest = last.slice(oldStem.length);
  const namesFile = last.startsWith(oldStem) && (rest === "" || /^\.[cm]?[jt]sx?$/.test(rest));
  return namesFile ? [...segments.slice(0, -1), `${newStem}${rest}`].join("/") : undefined;
};

/**
 * The edits one importer needs. A relative specifier is resolved to be sure it means the renamed file; an aliased one
 * is changed only when it is the importer's only specifier ending in the old name, since aliases are not resolved here.
 */
const importerEdits = (root: string, importer: string, text: string, rename: Rename): readonly TextEdit[] => {
  const absolute = join(root, importer);
  const target = join(root, rename.from);
  const found = literals(text).flatMap((literal) => {
    const replacement = renamedSpecifier(literal.value, rename);
    if (replacement === undefined) return [];
    const resolved = resolveRelative(absolute, literal.value);
    const isRelative = literal.value.startsWith(".");
    const isSameFile = resolved === target;
    return [{ edit: { start: literal.start, end: literal.start + literal.value.length, replacement }, isRelative, isSameFile }];
  });
  const relative = found.filter((entry) => entry.isRelative && entry.isSameFile);
  const aliased = found.filter((entry) => !entry.isRelative);
  return [...relative, ...(aliased.length === 1 ? aliased : [])].map((entry) => entry.edit);
};

const moveFile = (root: string, rename: Rename): string | ArchitectureError => {
  const isTracked = git(root, ["ls-files", "--error-unmatch", "--", rename.from]);
  // git mv records a case-only rename that a case-insensitive file system would otherwise hide from git.
  if (!(isTracked instanceof ArchitectureError)) return git(root, ["mv", "--", rename.from, rename.to]);
  const moved = tryCatch(() => {
    renameSync(join(root, rename.from), join(root, rename.to));
  });
  return moved instanceof ArchitectureError ? moved : "";
};

/** Renames the files and updates every import of them. Returns how many import specifiers changed. */
export const applyRenames = (root: string, result: CheckResult, renames: readonly Rename[]): number | ArchitectureError => {
  const edits = renames.flatMap((rename) => importersOf(result, rename.from).map((importer) => ({ importer, rename })));
  const byImporter = Map.groupBy(edits, (entry) => entry.importer);
  const changed = tryCatch(() => [...byImporter].map(([importer, entries]) => {
    const path = join(root, importer);
    const text = readFileSync(path, "utf8");
    const fileEdits = entries.flatMap((entry) => importerEdits(root, importer, text, entry.rename));
    writeFileSync(path, applyTextEdits(text, fileEdits));
    return fileEdits.length;
  }).reduce((total, count) => total + count, 0));
  if (changed instanceof ArchitectureError) return changed;
  const conflicting = renames.filter((rename) => rename.from.toLowerCase() !== rename.to.toLowerCase() && existsSync(join(root, rename.to)));
  if (conflicting.length > 0) return new ArchitectureError(conflicting.map((rename) => `Cannot rename ${rename.from}: ${rename.to} exists`));
  const moved = renames.map((rename) => moveFile(root, rename)).find((outcome) => outcome instanceof ArchitectureError);
  return moved instanceof ArchitectureError ? moved : changed;
};

