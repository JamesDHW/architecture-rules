import type { AST } from "eslint";

import { isRecord, isString, isUnknownArray } from "../core/guards.js";

/**
 * A node as Oxlint delivers it: ESTree plus TypeScript-ESTree, read structurally.
 * ESLint's types only describe ESTree, so TypeScript-specific fields are read
 * through these helpers instead of type assertions.
 */
export type SyntaxNode = Readonly<Record<string, unknown>> & { readonly type: string };

export const isSyntaxNode = (value: unknown): value is SyntaxNode => isRecord(value) && isString(value.type);

export const isNodeOfType = (value: unknown, type: string): value is SyntaxNode => isSyntaxNode(value) && value.type === type;

/** The child node stored under key, when there is one. */
export const childNode = (node: unknown, key: string): SyntaxNode | undefined => {
  if (!isRecord(node)) return undefined;
  const child = node[key];
  return isSyntaxNode(child) ? child : undefined;
};

/** The child nodes stored under key, ignoring holes and non-node entries. */
export const childNodes = (node: unknown, key: string): readonly SyntaxNode[] => {
  if (!isRecord(node)) return [];
  const children = node[key];
  return isUnknownArray(children) ? children.filter(isSyntaxNode) : [];
};

export const stringProperty = (node: unknown, key: string): string | undefined => {
  if (!isRecord(node)) return undefined;
  const value = node[key];
  return isString(value) ? value : undefined;
};

/** The name of an Identifier node; undefined for any other node. */
export const identifierName = (node: unknown): string | undefined => {
  return isNodeOfType(node, "Identifier") ? stringProperty(node, "name") : undefined;
};

/** Every direct child node, excluding the parent back-reference. */
export const directChildren = (node: SyntaxNode): readonly SyntaxNode[] => {
  return Object.entries(node)
    .filter(([key]) => key !== "parent")
    .flatMap(([, value]) => isUnknownArray(value) ? value.filter(isSyntaxNode) : [value].filter(isSyntaxNode));
};

const isPosition = (value: unknown): value is AST.SourceLocation["start"] => {
  return isRecord(value) && typeof value.line === "number" && typeof value.column === "number";
};

const isSourceLocation = (value: unknown): value is AST.SourceLocation => {
  return isRecord(value) && isPosition(value.start) && isPosition(value.end);
};

/** Report position for a structurally read node: context.report({ loc: locationOf(node), ... }). */
export const locationOf = (node: SyntaxNode): AST.SourceLocation | undefined => {
  return isSourceLocation(node.loc) ? node.loc : undefined;
};
