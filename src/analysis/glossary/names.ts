import { basename } from "node:path";
import {
  computeLineStarts,
  isArrowFunction,
  isBindingElement,
  isClassDeclaration,
  isClassExpression,
  isEnumDeclaration,
  isFunctionDeclaration,
  isFunctionExpression,
  isGetAccessorDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
  isMethodDeclaration,
  isMethodSignatureDeclaration,
  isParameterDeclaration,
  isPropertyDeclaration,
  isPropertySignatureDeclaration,
  isSetAccessorDeclaration,
  isTypeAliasDeclaration,
  isVariableDeclaration,
  SyntaxKind,
  type Identifier,
  type Node,
  type SourceFile,
} from "typescript/unstable/ast";

import { descendants } from "../syntaxTree.js";

/**
 * What a declared name names. Values (variables, parameters, properties) have a type that can agree or disagree with
 * the name; the rest are checked for their words only.
 */
type NameKind = "value" | "function" | "type" | "file";

/** A name the file declares, so the layer chose it: its text, what it names, and where. */
export type OwnedName = {
  readonly text: string;
  readonly kind: NameKind;
  /** The identifier, for asking its type; absent for the file name. */
  readonly node?: Identifier;
  /** 1-based; absent for the file name. */
  readonly line?: number;
  readonly column?: number;
  /** A top-level type, interface, class or enum declaration: where a glossary term's type can be declared. */
  readonly topLevelType?: boolean;
};

type Declared = { readonly name: Identifier; readonly kind: NameKind };

type WithModifiers = { readonly modifiers?: { readonly some: (test: (modifier: Node) => boolean) => boolean } | undefined };

const isOverride = (node: WithModifiers): boolean => node.modifiers?.some((modifier) => modifier.kind === SyntaxKind.OverrideKeyword) === true;

const isFunctionValue = (node: Node | undefined): boolean => {
  if (node === undefined) return false;
  return isArrowFunction(node) || isFunctionExpression(node) || isClassExpression(node);
};

const isInObjectLiteral = (node: Node): boolean => node.parent.kind === SyntaxKind.ObjectLiteralExpression;

const isIdentifierNode = (name: Node | undefined): name is Identifier => name !== undefined && isIdentifier(name);

const identifierName = (name: Node | undefined): Identifier | undefined => (isIdentifierNode(name) ? name : undefined);

const declared = (name: Node | undefined, kind: NameKind): readonly Declared[] => {
  const identifier = identifierName(name);
  return identifier === undefined ? [] : [{ name: identifier, kind }];
};

const memberName = (node: Node & WithModifiers & { readonly name: Node }, kind: NameKind): readonly Declared[] => {
  const isOthersShape = isOverride(node) || isInObjectLiteral(node);
  return isOthersShape ? [] : declared(node.name, kind);
};

/**
 * The name a node declares, when the layer chose it. Destructured names are the source's property names unless
 * renamed; object-literal keys and override methods follow a shape someone else defined.
 */
const declaredBy = (node: Node): readonly Declared[] => {
  if (isVariableDeclaration(node)) return declared(node.name, isFunctionValue(node.initializer) ? "function" : "value");
  if (isParameterDeclaration(node)) return declared(node.name, "value");
  if (isBindingElement(node)) return node.propertyName === undefined ? [] : declared(node.name, "value");
  if (isFunctionDeclaration(node)) return declared(node.name, "function");
  const isTypeDeclaration = isClassDeclaration(node) || isInterfaceDeclaration(node) || isTypeAliasDeclaration(node) || isEnumDeclaration(node);
  if (isTypeDeclaration) return declared(node.name, "type");
  const isProperty = isPropertyDeclaration(node) || isPropertySignatureDeclaration(node);
  if (isProperty) return memberName(node, "value");
  const isMethod = isMethodDeclaration(node) || isMethodSignatureDeclaration(node) || isGetAccessorDeclaration(node) || isSetAccessorDeclaration(node);
  return isMethod ? memberName(node, "function") : [];
};

/** The 0-based line containing an offset, by binary search over the line starts. */
const lineIndex = (starts: readonly number[], offset: number): number => {
  const search = (low: number, high: number): number => {
    if (low >= high) return low;
    const middle = Math.ceil((low + high) / 2);
    return (starts[middle] ?? 0) <= offset ? search(middle, high) : search(low, middle - 1);
  };
  return search(0, starts.length - 1);
};

/** The file's own name, without directories or any extension: customerList.test.ts is customerList. */
const fileName = (path: string): string => basename(path).split(".").at(0) ?? "";

/** Every name the file declares, and the file's own name. */
export const ownedNames = (source: SourceFile): readonly OwnedName[] => {
  const starts = computeLineStarts(source.text);
  const names = descendants(source).flatMap(declaredBy).map(({ name, kind }): OwnedName => {
    const offset = name.getStart(source);
    const line = lineIndex(starts, offset);
    const isTopLevel = kind === "type" && name.parent.parent.kind === SyntaxKind.SourceFile;
    return {
      text: name.text, kind, node: name, line: line + 1, column: offset - (starts[line] ?? 0) + 1,
      ...(isTopLevel ? { topLevelType: true } : {}),
    };
  });
  return [{ text: fileName(source.fileName), kind: "file" }, ...names];
};
