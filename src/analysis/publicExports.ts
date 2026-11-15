import { realpathSync } from "node:fs";
import { isExportDeclaration, isNamespaceExport, SyntaxKind, type ExportDeclaration, type Node } from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";

import { isPresent } from "../core/guards.js";
import type { ClassifiedFile } from "./inventory.js";
import { matches } from "./paths.js";

/** Whether the file is an entry: its layer is marked entry, and the entry's files (all, by default) include it. */
export const isEntryFile = (file: ClassifiedFile): boolean => {
  const { entry } = file.policy;
  if (entry === undefined) return false;
  return entry.files === undefined || matches(file.relative, entry.files);
};

/** Exports of a file something outside the program uses: their names, or every export. */
type Names = "all" | ReadonlySet<string>;

/** Public exports, keyed `file:name`, or `file:*` when every export of the file is public. */
export type PublicExports = ReadonlySet<string>;

type Context = { readonly projects: readonly Project[]; readonly byPath: ReadonlyMap<string, ClassifiedFile> };

const keyOf = (file: string, name: string): string => `${file}:${name}`;

const sourceOf = (context: Context, file: ClassifiedFile) => {
  return context.projects.map((project) => ({ project, source: project.program.getSourceFile(file.path) })).find(({ source }) => source !== undefined);
};

const targetOf = (context: Context, project: Project, specifier: Node): ClassifiedFile | undefined => {
  const declarations = project.checker.getSymbolAtLocation(specifier)?.declarations ?? [];
  const file = declarations.find((declaration) => declaration.kind === SyntaxKind.SourceFile);
  if (file === undefined) return undefined;
  const actual = realpathSync(project.program.getSourceFile(file.path)?.fileName ?? file.path);
  return context.byPath.get(actual);
};

const isPublic = (names: Names, name: string): boolean => names === "all" || names.has(name);

/** What a re-export passes on: the target's names that the re-exporting file makes public. */
const passedOn = (declaration: ExportDeclaration, names: Names): Names | undefined => {
  const clause = declaration.exportClause;
  if (clause === undefined) return names;
  if (isNamespaceExport(clause)) {
    if (!isPublic(names, clause.name.text)) return undefined;
    return "all";
  }
  const local = clause.elements.filter((element) => isPublic(names, element.name.text)).map((element) => (element.propertyName ?? element.name).text);
  if (local.length === 0) return undefined;
  return new Set(local);
};

const keysFor = (file: ClassifiedFile, names: Names): readonly string[] => {
  return names === "all" ? [keyOf(file.relative, "*")] : [...names].map((name) => keyOf(file.relative, name));
};

/** Follows a public file's re-exports to where each public value is declared. */
const origins = (context: Context, file: ClassifiedFile, names: Names, seen: ReadonlySet<string>): readonly string[] => {
  const found = sourceOf(context, file);
  if (found?.source === undefined) return [];
  const { project, source } = found;
  return source.statements.filter(isExportDeclaration).flatMap((declaration) => {
    const specifier = declaration.moduleSpecifier;
    if (specifier === undefined) return [];
    const target = targetOf(context, project, specifier);
    const passed = passedOn(declaration, names);
    const isFollowed = target !== undefined && passed !== undefined;
    if (!isFollowed) return [];
    const keys = keysFor(target, passed).filter((key) => !seen.has(key));
    if (keys.length === 0) return [];
    return [...keys, ...origins(context, target, passed, new Set([...seen, ...keys]))];
  });
};

const entryNames = (file: ClassifiedFile): Names | undefined => {
  const exports = file.policy.entry?.exports;
  const isNamingEntry = exports !== undefined && isEntryFile(file);
  if (!isNamingEntry) return undefined;
  if (exports === "all") return "all";
  return new Set(exports);
};

/**
 * The exports something outside the program uses: those an entry's layer names, and, through the entry's
 * re-exports, where each of them is declared. `export … from` and `export * from` are followed.
 */
export const publicExports = (files: readonly ClassifiedFile[], projects: readonly Project[]): PublicExports => {
  const context: Context = { projects, byPath: new Map(files.map((file) => [realpathSync(file.path), file])) };
  return new Set(files.flatMap((file) => {
    const names = entryNames(file);
    if (names === undefined) return [];
    const own = keysFor(file, names);
    return [...own, ...origins(context, file, names, new Set(own))];
  }).filter(isPresent));
};

export const isPublicExport = (exports: PublicExports, file: string, name: string): boolean => {
  return exports.has(keyOf(file, "*")) || exports.has(keyOf(file, name));
};
