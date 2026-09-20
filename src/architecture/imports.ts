import { isBuiltin } from "node:module";
import { existsSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { SyntaxKind, isCallExpression, isExportDeclaration, isExternalModuleReference, isIdentifier, isImportDeclaration, isImportTypeNode, isLiteralTypeNode, isStringLiteral, isNoSubstitutionTemplateLiteral, isVariableDeclaration, type Node, type SourceFile } from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";

export type ImportIssue = Issue & { readonly column: number };
export const checkImports = (root: string, files: readonly ClassifiedFile[], projects: readonly Project[]): ImportIssue[] => {
  const byPath = new Map(files.map((file) => [realpathSync(file.path), file]));
  const issues = new Map<string, ImportIssue>();
  for (const file of files) {
    for (const project of projects) {
      const source = project.program.getSourceFile(file.path);
      if (source === undefined) continue;
      const report = (node: Node, message: string) => {
        const start = node.getStart(source);
        const prefix = source.text.slice(0, start);
        const line = prefix.split("\n").length;
        const column = start - prefix.lastIndexOf("\n") - 1;
        const issue = { ruleId: "allowed-imports", file: file.relative, line, column, message };
        issues.set(`${file.path}:${start}:${message}`, issue);
      };
      const checkTarget = (node: Node, target: string): void => {
        const actual = realpathSync(target);
        const classified = byPath.get(actual);
        if (!inside(root, actual)) { report(node, `Import target escapes architecture root: ${target}`); return; }
        if (classified === undefined) { report(node, `Import target is not governed source: ${relativePath(root, actual)}`); return; }
        if (!file.policy.imports.internal.includes(classified.type)) report(node, `File type ${file.type} may not import ${classified.type}: ${classified.relative}`);
      };
      const check = (node: Node): void => {
        if (!isStringLiteral(node) && !isNoSubstitutionTemplateLiteral(node)) { report(node, "Nonliteral module loading cannot be verified. Use a literal import or a documented line exception."); return; }
        const specifier = node.text;
        if (isBuiltin(specifier)) {
          if (!matches(specifier.replace(/^node:/, ""), file.policy.imports.builtins)) report(node, `Built-in import is not permitted: ${specifier}`);
          return;
        }
        const local = specifier.startsWith(".") || specifier.startsWith("/");
        const asset = resolve(dirname(file.path), specifier);
        if (local && !sourceFile(asset) && existsSync(asset)) {
          const actual = realpathSync(asset);
          if (!inside(root, actual) || !matches(relativePath(root, actual), file.policy.imports.assets)) report(node, `Asset import is not permitted: ${specifier}`);
          return;
        }
        const symbol = project.checker.getSymbolAtLocation(node);
        const declarations = symbol?.declarations ?? [];
        const targets = [...new Set(declarations.map((declaration) => declaration.path))];
        const sourceTargets = declarations.filter((declaration) => declaration.kind === SyntaxKind.SourceFile).map((declaration) => declaration.path);
        const managed = sourceTargets.filter((path) => existsSync(path) && !infrastructure(realpathSync(path)));
        if (managed.length > 0) {
          for (const target of managed) checkTarget(node, target);
          return;
        }
        if (local) {
          report(node, `Cannot resolve local import to governed source: ${specifier}`);
          return;
        }
        if (targets.length === 0) {
          report(node, `Unresolved external import: ${specifier} (project ${relativePath(root, project.configFileName)})`);
          return;
        }
        if (!matches(specifier, file.policy.imports.external)) report(node, `External import is not permitted: ${specifier}`);
      };
      const visit = (node: Node): void => {
        if (isImportDeclaration(node) || isExportDeclaration(node)) {
          if (node.moduleSpecifier !== undefined) check(node.moduleSpecifier);
        } else if (isExternalModuleReference(node)) {
          if (node.expression !== undefined) check(node.expression);
        } else if (isImportTypeNode(node)) {
          check(isLiteralTypeNode(node.argument) ? node.argument.literal : node.argument);
        } else if (isCallExpression(node)) {
          if (node.expression.kind === SyntaxKind.ImportKeyword) check(node.arguments[0] ?? node);
          if (isIdentifier(node.expression) && node.expression.text === "require") {
            const symbol = project.checker.getSymbolAtLocation(node.expression);
            const localDefinitions = symbol?.declarations.filter((declaration) => !infrastructure(declaration.path)) ?? [];
            const createdRequire = localDefinitions.some((declaration) => {
              const binding = declaration.resolve(project);
              if (binding === undefined || !isVariableDeclaration(binding) || binding.initializer === undefined || !isCallExpression(binding.initializer)) return false;
              const factory = binding.initializer.expression;
              if (!isIdentifier(factory)) return false;
              const factorySymbol = project.checker.getSymbolAtLocation(factory);
              return factorySymbol?.declarations.some((handle) => {
                let definition = handle.resolve(project);
                while (definition !== undefined && definition.kind !== SyntaxKind.SourceFile) {
                  if (isImportDeclaration(definition)) return isStringLiteral(definition.moduleSpecifier) && ["node:module", "module"].includes(definition.moduleSpecifier.text);
                  definition = definition.parent;
                }
                return false;
              }) ?? false;
            });
            if (localDefinitions.length === 0 || createdRequire) check(node.arguments[0] ?? node);
          }
        }
        node.forEachChild((child) => { visit(child); });
      };
      visit(source);
      checkReferences(source, file, report, checkTarget);
    }
  }
  return [...issues.values()];
};

const checkReferences = (source: SourceFile, file: ClassifiedFile, report: (node: Node, message: string) => void, checkTarget: (node: Node, target: string) => void): void => {
  for (const reference of source.referencedFiles) {
    const target = resolve(dirname(file.path), reference.fileName);
    if (existsSync(target)) checkTarget(source, target);
    else report(source, `Unresolved reference path: ${reference.fileName}`);
  }
  for (const reference of source.typeReferenceDirectives) {
    if (!matches(reference.fileName, file.policy.imports.external)) report(source, `Type reference is not permitted: ${reference.fileName}`);
  }
};
