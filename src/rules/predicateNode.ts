import { isString, isUnknownArray } from "../core/guards.js";
import type { PredicateNode } from "./structuralGuardCondition.js";
import { childNodes, isSyntaxNode, type SyntaxNode } from "./syntaxNode.js";

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

/** Copies the fields PredicateNode declares from a syntax node, validating each one instead of asserting the shape. */
export const readPredicateNode = (node: SyntaxNode): PredicateNode => ({
  type: node.type,
  ...(isString(node.name) ? { name: node.name } : {}),
  ...(isString(node.operator) ? { operator: node.operator } : {}),
  ...(isBoolean(node.computed) ? { computed: node.computed } : {}),
  ...(isBoolean(node.optional) ? { optional: node.optional } : {}),
  ...(isSyntaxNode(node.object) ? { object: readPredicateNode(node.object) } : {}),
  ...(isSyntaxNode(node.property) ? { property: readPredicateNode(node.property) } : {}),
  ...(isSyntaxNode(node.callee) ? { callee: readPredicateNode(node.callee) } : {}),
  ...(isUnknownArray(node.arguments) ? { arguments: childNodes(node, "arguments").map(readPredicateNode) } : {}),
  ...(isSyntaxNode(node.argument) ? { argument: readPredicateNode(node.argument) } : {}),
  ...(isSyntaxNode(node.left) ? { left: readPredicateNode(node.left) } : {}),
  ...(isSyntaxNode(node.right) ? { right: readPredicateNode(node.right) } : {}),
  ...(isSyntaxNode(node.expression) ? { expression: readPredicateNode(node.expression) } : {}),
  ...(isSyntaxNode(node.test) ? { test: readPredicateNode(node.test) } : {}),
  ...(isSyntaxNode(node.consequent) ? { consequent: readPredicateNode(node.consequent) } : {}),
  ...(isSyntaxNode(node.alternate) ? { alternate: readPredicateNode(node.alternate) } : {}),
  value: node.value,
  regex: node.regex,
});

/** Reads any node-shaped value, such as a Rule.Node, as a PredicateNode. */
export const toPredicateNode = (value: unknown): PredicateNode | undefined => {
  return isSyntaxNode(value) ? readPredicateNode(value) : undefined;
};
