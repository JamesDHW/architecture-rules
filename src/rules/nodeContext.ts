import type { Rule, SourceCode } from "eslint";

/** Any ESTree node, as context.report and scope lookups accept it. */
export type EstreeNode = Parameters<SourceCode["getScope"]>[0];

export const isFunctionNode = (node: Rule.Node): boolean => {
  return node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression";
};

const isInvokedWhereWritten = (node: Rule.Node): boolean => {
  return node.parent?.type === "CallExpression" && node.parent.callee === node;
};

/** A function whose body runs later, unlike an immediately invoked function expression. */
export const isDeferredFunction = (node: Rule.Node): boolean => isFunctionNode(node) && !isInvokedWhereWritten(node);

/** The nearest function at or above node. */
export const findEnclosingFunction = (node: Rule.Node | null): Rule.Node | undefined => {
  if (node === null) return undefined;
  return isFunctionNode(node) ? node : findEnclosingFunction(node.parent);
};

/** True when node is the test of an if statement, a classic loop or a ternary. */
export const isBranchTest = (node: Rule.Node): boolean => {
  const { parent } = node;
  const isBranch = parent?.type === "IfStatement" || parent?.type === "WhileStatement" || parent?.type === "DoWhileStatement" ||
    parent?.type === "ForStatement" || parent?.type === "ConditionalExpression";
  return isBranch && parent.test === node;
};
