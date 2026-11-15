import type { Node } from "typescript/unstable/ast";

/** TypeScript's AST exposes children only through a forEachChild callback, so they are collected here once. */
export const childrenOf = (node: Node): readonly Node[] => {
  const children: Node[] = [];
  // architecture-disable-next-line no-array-mutation, no-captured-mutation -- forEachChild is the only child accessor TypeScript's AST offers.
  node.forEachChild((child) => { children.push(child); });
  return children;
};

/** The node followed by every node beneath it, in source order. */
export const descendants = (node: Node): readonly Node[] => [node, ...childrenOf(node).flatMap(descendants)];
