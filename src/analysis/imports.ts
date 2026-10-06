import { existsSync, realpathSync } from "node:fs";
import { isBuiltin } from "node:module";
import { dirname, resolve } from "node:path";
import {
  isCallExpression, isExportDeclaration, isExternalModuleReference, isIdentifier, isImportDeclaration, isImportTypeNode,
  isLiteralTypeNode, isNoSubstitutionTemplateLiteral, isStringLiteral, isVariableDeclaration, SyntaxKind,
  type CallExpression, type ExportDeclaration, type Identifier, type ImportDeclaration, type NoSubstitutionTemplateLiteral,
  type Node, type SourceFile, type StringLiteral, type VariableDeclaration,
} from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";

import type { ClassifiedFile, Issue } from "./inventory.js";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";
import { descendants } from "./syntaxTree.js";

export type ImportIssue = Issue & { readonly line: number; readonly column: number };

type FileContext = {
  readonly root: string;
  readonly file: ClassifiedFile;
  readonly project: Project;
  readonly source: SourceFile;
  readonly byPath: ReadonlyMap<string, ClassifiedFile>;
};

const nodeModuleSpecifiers: readonly string[] = ["node:module", "module"];

const issueAt = (context: FileContext, node: Node, message: string): ImportIssue => {
  const start = node.getStart(context.source);
  const prefix = context.source.text.slice(0, start);
  return { ruleId: "allowed-imports", file: context.file.relative, line: prefix.split("\n").length, column: start - prefix.lastIndexOf("\n") - 1, message };
};

const isModuleDeclaration = (node: Node): node is ImportDeclaration | ExportDeclaration => isImportDeclaration(node) || isExportDeclaration(node);

const isLiteralSpecifier = (node: Node): node is StringLiteral | NoSubstitutionTemplateLiteral => {
  return isStringLiteral(node) || isNoSubstitutionTemplateLiteral(node);
};

const isManagedSource = (path: string): boolean => existsSync(path) && !infrastructure(realpathSync(path));

const targetIssues = (context: FileContext, node: Node, target: string): readonly ImportIssue[] => {
  // Declaration handles use canonical (lowercase on case-insensitive hosts) paths; recover the program's filename first.
  const actual = realpathSync(context.project.program.getSourceFile(target)?.fileName ?? target);
  const classified = context.byPath.get(actual);
  if (!inside(context.root, actual)) return [issueAt(context, node, `Import target escapes architecture root: ${target}`)];
  if (classified === undefined) return [issueAt(context, node, `Import target is not governed source: ${relativePath(context.root, actual)}`)];
  if (context.file.policy.imports.internal.includes(classified.type)) return [];
  return [issueAt(context, node, `File type ${context.file.type} may not import ${classified.type}: ${classified.relative}`)];
};

const builtinIssues = (context: FileContext, node: Node, specifier: string): readonly ImportIssue[] => {
  if (matches(specifier.replace(/^node:/, ""), context.file.policy.imports.builtins)) return [];
  return [issueAt(context, node, `Built-in import is not permitted: ${specifier}`)];
};

const assetIssues = (context: FileContext, node: Node, specifier: string, asset: string): readonly ImportIssue[] => {
  const actual = realpathSync(asset);
  const isPermitted = inside(context.root, actual) && matches(relativePath(context.root, actual), context.file.policy.imports.assets);
  return isPermitted ? [] : [issueAt(context, node, `Asset import is not permitted: ${specifier}`)];
};

const moduleIssues = (context: FileContext, node: Node, specifier: string, isLocal: boolean): readonly ImportIssue[] => {
  const declarations = context.project.checker.getSymbolAtLocation(node)?.declarations ?? [];
  const managed = declarations
    .filter((declaration) => declaration.kind === SyntaxKind.SourceFile)
    .map((declaration) => declaration.path)
    .filter(isManagedSource);
  if (managed.length > 0) return managed.flatMap((target) => targetIssues(context, node, target));
  if (isLocal) return [issueAt(context, node, `Cannot resolve local import to governed source: ${specifier}`)];
  if (declarations.length === 0) {
    return [issueAt(context, node, `Unresolved external import: ${specifier} (project ${relativePath(context.root, context.project.configFileName)})`)];
  }
  if (matches(specifier, context.file.policy.imports.external)) return [];
  return [issueAt(context, node, `External import is not permitted: ${specifier}`)];
};

const specifierIssues = (context: FileContext, node: Node): readonly ImportIssue[] => {
  if (!isLiteralSpecifier(node)) {
    return [issueAt(context, node, "Nonliteral module loading cannot be verified. Use a literal import or a documented line exception.")];
  }
  const specifier = node.text;
  if (isBuiltin(specifier)) return builtinIssues(context, node, specifier);
  const isLocal = specifier.startsWith(".") || specifier.startsWith("/");
  const asset = resolve(dirname(context.file.path), specifier);
  const isAssetImport = isLocal && !sourceFile(asset) && existsSync(asset);
  if (isAssetImport) return assetIssues(context, node, specifier, asset);
  return moduleIssues(context, node, specifier, isLocal);
};

/** Walks up from a declaration to the import that brought its value in, when there is one. */
const isNodeModuleImport = (node: Node | undefined): boolean => {
  if (node === undefined) return false;
  if (isImportDeclaration(node)) return isStringLiteral(node.moduleSpecifier) && nodeModuleSpecifiers.includes(node.moduleSpecifier.text);
  return node.kind !== SyntaxKind.SourceFile && isNodeModuleImport(node.parent);
};

const isVariable = (node: Node | undefined): node is VariableDeclaration => node !== undefined && isVariableDeclaration(node);

const isCall = (node: Node | undefined): node is CallExpression => node !== undefined && isCallExpression(node);

/** The function a declaration's initializer calls, when it is a call of a plain identifier. */
const initializerFactory = (declaration: Node | undefined): Identifier | undefined => {
  const initializer = isVariable(declaration) ? declaration.initializer : undefined;
  if (!isCall(initializer)) return undefined;
  return isIdentifier(initializer.expression) ? initializer.expression : undefined;
};

/** A local require created with createRequire from node:module loads modules like the global one. */
const isCreatedRequire = (project: Project, declaration: Node | undefined): boolean => {
  const factory = initializerFactory(declaration);
  if (factory === undefined) return false;
  return project.checker.getSymbolAtLocation(factory)?.declarations.some((handle) => isNodeModuleImport(handle.resolve(project))) ?? false;
};

const isModuleRequire = (project: Project, call: CallExpression): boolean => {
  const callee = call.expression;
  const callsRequire = isIdentifier(callee) && callee.text === "require";
  if (!callsRequire) return false;
  const localDefinitions = project.checker.getSymbolAtLocation(callee)?.declarations.filter((declaration) => !infrastructure(declaration.path)) ?? [];
  return localDefinitions.length === 0 || localDefinitions.some((declaration) => isCreatedRequire(project, declaration.resolve(project)));
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

const tripleSlashIssues = (context: FileContext): readonly ImportIssue[] => {
  const { source, file } = context;
  const pathIssues = source.referencedFiles.flatMap((reference) => {
    const target = resolve(dirname(file.path), reference.fileName);
    if (existsSync(target)) return targetIssues(context, source, target);
    return [issueAt(context, source, `Unresolved reference path: ${reference.fileName}`)];
  });
  const typeIssues = source.typeReferenceDirectives
    .filter((reference) => !matches(reference.fileName, file.policy.imports.external))
    .map((reference) => issueAt(context, source, `Type reference is not permitted: ${reference.fileName}`));
  return [...pathIssues, ...typeIssues];
};

const fileImportIssues = (root: string, file: ClassifiedFile, project: Project, byPath: ReadonlyMap<string, ClassifiedFile>): readonly ImportIssue[] => {
  const source = project.program.getSourceFile(file.path);
  if (source === undefined) return [];
  const context: FileContext = { root, file, project, source, byPath };
  const references = descendants(source).flatMap((node) => moduleReferences(project, node));
  return [...references.flatMap((reference) => specifierIssues(context, reference)), ...tripleSlashIssues(context)];
};

export const checkImports = (root: string, files: readonly ClassifiedFile[], projects: readonly Project[]): readonly ImportIssue[] => {
  const byPath = new Map(files.map((file) => [realpathSync(file.path), file]));
  const issues = files.flatMap((file) => projects.flatMap((project) => fileImportIssues(root, file, project, byPath)));
  return [...new Map(issues.map((issue) => [`${issue.file}:${issue.line}:${issue.column}:${issue.message}`, issue])).values()];
};
