import { existsSync, realpathSync } from "node:fs";
import { isBuiltin } from "node:module";
import { dirname, resolve } from "node:path";
import {
  isCallExpression, isExportDeclaration, isExternalModuleReference, isImportDeclaration, isImportTypeNode,
  isLiteralTypeNode, isNoSubstitutionTemplateLiteral, isStringLiteral, SyntaxKind,
  type CallExpression, type ExportDeclaration, type ImportDeclaration, type NoSubstitutionTemplateLiteral,
  type Node, type SourceFile, type StringLiteral,
} from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";

import type { ClassifiedFile, Issue } from "./inventory.js";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";
import { jsxRuntimeUses } from "./jsxRuntime.js";
import { isModuleRequire } from "./requireCalls.js";
import { descendants } from "./syntaxTree.js";

/** The governed file and layer a denied import reached, when it reached one. */
type ImportTarget = { readonly layer: string; readonly file: string };

export type ImportIssue = Issue & { readonly line: number; readonly column: number; readonly target?: ImportTarget };

/** A permission an import relied on: a layer, an external specifier (built-ins with node:) or an asset path. */
export type ImportUse = { readonly layer: string; readonly kind: "internal" | "external" | "asset"; readonly value: string };

/** An allowed import of one governed file by another, both root-relative. */
export type ImportLink = { readonly from: string; readonly to: string };

/** What one module reference found: a denied import, or the permission that allowed it and, for source, the file it reached. */
type Outcome = { readonly issue: ImportIssue } | { readonly use: ImportUse; readonly link?: ImportLink };

/** Every import problem, every permission that some import used, and every allowed import between governed files. */
export type ImportAnalysis = { readonly issues: readonly ImportIssue[]; readonly uses: readonly ImportUse[]; readonly links: readonly ImportLink[] };

type FileContext = {
  readonly root: string;
  readonly file: ClassifiedFile;
  readonly project: Project;
  readonly source: SourceFile;
  readonly byPath: ReadonlyMap<string, ClassifiedFile>;
};


const issueAt = (context: FileContext, node: Node, message: string, target: ImportTarget | undefined): ImportIssue => {
  const start = node.getStart(context.source);
  const prefix = context.source.text.slice(0, start);
  const line = prefix.split("\n").length;
  const column = start - prefix.lastIndexOf("\n") - 1;
  return { ruleId: "allowed-imports", file: context.file.relative, line, column, message, ...(target === undefined ? {} : { target }) };
};

const denied = (context: FileContext, node: Node, message: string, target?: ImportTarget): Outcome => ({ issue: issueAt(context, node, message, target) });

const used = (context: FileContext, kind: ImportUse["kind"], value: string): Outcome => ({ use: { layer: context.file.layer, kind, value } });

const isModuleDeclaration = (node: Node): node is ImportDeclaration | ExportDeclaration => isImportDeclaration(node) || isExportDeclaration(node);

const isLiteralSpecifier = (node: Node): node is StringLiteral | NoSubstitutionTemplateLiteral => {
  return isStringLiteral(node) || isNoSubstitutionTemplateLiteral(node);
};

const isManagedSource = (path: string): boolean => existsSync(path) && !infrastructure(realpathSync(path));

const targetIssues = (context: FileContext, node: Node, target: string): readonly Outcome[] => {
  // Declaration handles use canonical (lowercase on case-insensitive hosts) paths; recover the program's filename first.
  const actual = realpathSync(context.project.program.getSourceFile(target)?.fileName ?? target);
  const classified = context.byPath.get(actual);
  if (!inside(context.root, actual)) return [denied(context, node, `Import target escapes architecture root: ${target}`)];
  if (classified === undefined) return [denied(context, node, `Import target is not governed source: ${relativePath(context.root, actual)}`)];
  if (context.file.policy.dependencies.internal.includes(classified.layer)) {
    return [{ ...used(context, "internal", classified.layer), link: { from: context.file.relative, to: classified.relative } }];
  }
  const reached = { layer: classified.layer, file: classified.relative };
  return [denied(context, node, `Layer ${context.file.layer} may not import ${classified.layer}: ${classified.relative}`, reached)];
};

/** Built-ins are permitted as node: specifiers, whichever way the import spells them. */
const builtinIssues = (context: FileContext, node: Node, specifier: string): readonly Outcome[] => {
  const prefixed = `node:${specifier.replace(/^node:/, "")}`;
  if (matches(prefixed, context.file.policy.dependencies.external)) return [used(context, "external", prefixed)];
  return [denied(context, node, `External import is not permitted: ${prefixed}`)];
};

const assetIssues = (context: FileContext, node: Node, specifier: string, asset: string): readonly Outcome[] => {
  const actual = realpathSync(asset);
  const relative = relativePath(context.root, actual);
  const isPermitted = inside(context.root, actual) && matches(relative, context.file.policy.dependencies.assets);
  return isPermitted ? [used(context, "asset", relative)] : [denied(context, node, `Asset import is not permitted: ${specifier}`)];
};

const moduleIssues = (context: FileContext, node: Node, specifier: string, isLocal: boolean): readonly Outcome[] => {
  const declarations = context.project.checker.getSymbolAtLocation(node)?.declarations ?? [];
  const managed = declarations
    .filter((declaration) => declaration.kind === SyntaxKind.SourceFile)
    .map((declaration) => declaration.path)
    .filter(isManagedSource);
  if (managed.length > 0) return managed.flatMap((target) => targetIssues(context, node, target));
  if (isLocal) return [denied(context, node, `Cannot resolve local import to governed source: ${specifier}`)];
  if (declarations.length === 0) {
    return [denied(context, node, `Unresolved external import: ${specifier} (project ${relativePath(context.root, context.project.configFileName)})`)];
  }
  if (matches(specifier, context.file.policy.dependencies.external)) return [used(context, "external", specifier)];
  return [denied(context, node, `External import is not permitted: ${specifier}`)];
};

const specifierIssues = (context: FileContext, node: Node): readonly Outcome[] => {
  if (!isLiteralSpecifier(node)) {
    return [denied(context, node, "Nonliteral module loading cannot be verified. Use a literal import or a documented line exception.")];
  }
  const specifier = node.text;
  if (isBuiltin(specifier)) return builtinIssues(context, node, specifier);
  const isLocal = specifier.startsWith(".") || specifier.startsWith("/");
  const asset = resolve(dirname(context.file.path), specifier);
  const isAssetImport = isLocal && !sourceFile(asset) && existsSync(asset);
  if (isAssetImport) return assetIssues(context, node, specifier, asset);
  return moduleIssues(context, node, specifier, isLocal);
};

const callReferences = (project: Project, call: CallExpression): readonly Node[] => {
  const target = call.arguments.at(0) ?? call;
  const loadsModule = call.expression.kind === SyntaxKind.ImportKeyword || isModuleRequire(project, call);
  return loadsModule ? [target] : [];
};

/** The module specifiers a node refers to: imports, re-exports, import types, import-equals, dynamic import and require. */
const moduleReferences = (project: Project, node: Node): readonly Node[] => {
  if (isModuleDeclaration(node)) return node.moduleSpecifier === undefined ? [] : [node.moduleSpecifier];
  if (isExternalModuleReference(node)) return [node.expression];
  if (isImportTypeNode(node)) return [isLiteralTypeNode(node.argument) ? node.argument.literal : node.argument];
  if (isCallExpression(node)) return callReferences(project, node);
  return [];
};

const tripleSlashIssues = (context: FileContext): readonly Outcome[] => {
  const { source, file } = context;
  const pathIssues = source.referencedFiles.flatMap((reference) => {
    const target = resolve(dirname(file.path), reference.fileName);
    if (existsSync(target)) return targetIssues(context, source, target);
    return [denied(context, source, `Unresolved reference path: ${reference.fileName}`)];
  });
  const typeIssues = source.typeReferenceDirectives.map((reference) => {
    const isPermitted = matches(reference.fileName, file.policy.dependencies.external);
    return isPermitted ? used(context, "external", reference.fileName) : denied(context, source, `Type reference is not permitted: ${reference.fileName}`);
  });
  return [...pathIssues, ...typeIssues];
};

const fileImportIssues = (root: string, file: ClassifiedFile, project: Project, byPath: ReadonlyMap<string, ClassifiedFile>): readonly Outcome[] => {
  const source = project.program.getSourceFile(file.path);
  if (source === undefined) return [];
  const context: FileContext = { root, file, project, source, byPath };
  const references = descendants(source).flatMap((node) => moduleReferences(project, node));
  return [...references.flatMap((reference) => specifierIssues(context, reference)), ...tripleSlashIssues(context), ...jsxRuntimeUses(file, project).map((use) => ({ use }))];
};

const issueOf = (outcome: Outcome): readonly ImportIssue[] => ("issue" in outcome ? [outcome.issue] : []);

const useOf = (outcome: Outcome): readonly ImportUse[] => ("use" in outcome ? [outcome.use] : []);

const linkOf = (outcome: Outcome): readonly ImportLink[] => {
  if ("issue" in outcome) return [];
  return outcome.link === undefined ? [] : [outcome.link];
};

/** Checks every import against its layer's dependencies, and records the permissions the allowed ones used. */
export const analyzeImports = (root: string, files: readonly ClassifiedFile[], projects: readonly Project[]): ImportAnalysis => {
  const byPath = new Map(files.map((file) => [realpathSync(file.path), file]));
  const outcomes = files.flatMap((file) => projects.flatMap((project) => fileImportIssues(root, file, project, byPath)));
  const issues = outcomes.flatMap(issueOf);
  const uses = outcomes.flatMap(useOf);
  const links = outcomes.flatMap(linkOf);
  return {
    links: [...new Map(links.map((link) => [`${link.from}\0${link.to}`, link])).values()],
    issues: [...new Map(issues.map((issue) => [`${issue.file}:${issue.line}:${issue.column}:${issue.message}`, issue])).values()],
    uses: [...new Map(uses.map((use) => [`${use.layer}:${use.kind}:${use.value}`, use])).values()],
  };
};
