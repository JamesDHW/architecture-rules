import type { Rule } from "eslint";

import { isPresent } from "../core/guards.js";
import { readPredicateNode, toPredicateNode } from "./predicateNode.js";
import { isGuardedNullishFallback, isStructuralGuardCondition, type GuardNames, type PredicateNode } from "./structuralGuardCondition.js";
import { childNode, isNodeOfType } from "./syntaxNode.js";

const isTransparentWrapper = (type: string): boolean => {
  return ["ChainExpression", "TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "ParenthesizedExpression"].includes(type);
};

/** True when test is, beneath unary operators and transparent wrappers, a compound condition outside the structural guard exception. */
export const needsName = (test: PredicateNode | undefined, guards: GuardNames): boolean => {
  if (test === undefined) return false;
  if (test.type === "UnaryExpression") return needsName(test.argument, guards);
  if (isTransparentWrapper(test.type)) return needsName(test.expression, guards);
  return test.type === "LogicalExpression" && !isStructuralGuardCondition(test, guards);
};

export const isNullishFallback = (node: Rule.Node, guards: GuardNames): boolean => {
  const choice = toPredicateNode(node);
  return choice !== undefined && isGuardedNullishFallback(choice, guards);
};

const isJsx = (node: unknown): boolean => isNodeOfType(node, "JSXElement") || isNodeOfType(node, "JSXFragment");

/** The condition of an && chain that ends in JSX, such as isOwner && <EditButton />; undefined for other expressions. */
export const getJsxPresenceCondition = (node: unknown): PredicateNode | undefined => {
  const left = childNode(node, "left");
  const right = childNode(node, "right");
  const isAndChain = isNodeOfType(node, "LogicalExpression") && node.operator === "&&" && isPresent(left) && isPresent(right);
  if (!isAndChain) return undefined;
  if (isJsx(right)) return readPredicateNode(left);
  const innerCondition = getJsxPresenceCondition(right);
  return innerCondition === undefined ? undefined : { type: "LogicalExpression", operator: "&&", left: readPredicateNode(left), right: innerCondition };
};

/** The right operand of an enclosing && is checked as part of that outer chain. */
export const continuesAndChain = (node: Rule.Node): boolean => {
  return node.parent?.type === "LogicalExpression" && node.parent.operator === "&&" && node.parent.right === node;
};
