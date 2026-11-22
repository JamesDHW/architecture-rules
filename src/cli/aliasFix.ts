import { readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { posix } from "../analysis/paths.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
import type { Finding } from "../runner/findings.js";
import type { ProjectAliases } from "../runner/projectAliases.js";
import { applyTextEdits, literals, resolveRelative, type TextEdit } from "./specifiers.js";

const isDeepRelative = (specifier: string): boolean => (specifier.match(/\.\.\//g)?.length ?? 0) >= 3;

const extensionOf = (path: string): string => /(?:\.d)?\.[cm]?[jt]sx?$/i.exec(path)?.[0] ?? "";

/** The specifier an alias pattern gives a file, keeping the extension style the import used, or undefined. */
const throughAlias = (alias: string, targetPattern: string, base: string, file: string, written: string): string | undefined => {
  const [before = "", after = ""] = targetPattern.split("*");
  const prefix = resolve(base, before);
  const hasWildcard = alias.includes("*") && targetPattern.includes("*");
  if (!hasWildcard) return resolve(base, targetPattern) === file ? alias : undefined;
  const isUnder = file.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`) || file.startsWith(prefix);
  if (!isUnder) return undefined;
  const captured = posix(relative(prefix, file)).replace(/^\//, "");
  const hasSuffix = after.length > 0 && captured.endsWith(after);
  const withoutSuffix = hasSuffix ? captured.slice(0, -after.length) : captured;
  const extension = extensionOf(written);
  const stem = withoutSuffix.slice(0, withoutSuffix.length - extensionOf(withoutSuffix).length);
  const kept = extension === "" ? stem : `${stem}${extension.replace(/\.ts$/, ".js").replace(/\.tsx$/, ".js")}`;
  return alias.replace("*", kept);
};

/** The shortest alias specifier that reaches the file, from the projects that hold the importer. */
const aliasFor = (aliases: readonly ProjectAliases[], importer: string, file: string, written: string): string | undefined => {
  const options = aliases
    .filter((project) => project.sources.has(importer))
    .flatMap((project) => Object.entries(project.paths).flatMap(([alias, targets]) => targets.map((target) => throughAlias(alias, target, project.base, file, written))))
    .filter((specifier): specifier is string => specifier !== undefined);
  return options.toSorted((left, right) => left.length - right.length).at(0);
};

/** The edits for one file's deep relative imports, on the lines the findings point at. */
const fileEdits = (root: string, file: string, lines: ReadonlySet<number>, aliases: readonly ProjectAliases[], text: string): readonly TextEdit[] => {
  const importer = join(root, file);
  return literals(text).flatMap((literal) => {
    const line = text.slice(0, literal.start).split("\n").length;
    const isReported = lines.has(line) && isDeepRelative(literal.value);
    if (!isReported) return [];
    const target = resolveRelative(importer, literal.value);
    const specifier = target === undefined ? undefined : aliasFor(aliases, importer, target, literal.value);
    return specifier === undefined ? [] : [{ start: literal.start, end: literal.start + literal.value.length, replacement: specifier }];
  });
};

/** Rewrites deep relative imports through the projects' path aliases. Returns how many changed and how many had no alias. */
export const applyAliases = (root: string, findings: readonly Finding[], aliases: readonly ProjectAliases[]): { readonly changed: number; readonly unchanged: number } | ArchitectureError => {
  const byFile = Map.groupBy(findings, (finding) => finding.file);
  const counts = tryCatch(() => [...byFile].map(([file, group]) => {
    const path = join(root, file);
    const text = readFileSync(path, "utf8");
    const edits = fileEdits(root, file, new Set(group.map((finding) => finding.line ?? 0)), aliases, text);
    if (edits.length > 0) {
      writeFileSync(path, applyTextEdits(text, edits));
    }
    return { changed: edits.length, unchanged: group.length - edits.length };
  }));
  if (counts instanceof ArchitectureError) return counts;
  return { changed: counts.reduce((total, count) => total + count.changed, 0), unchanged: counts.reduce((total, count) => total + count.unchanged, 0) };
};
