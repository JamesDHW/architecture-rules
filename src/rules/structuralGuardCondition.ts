import { childNode, childNodes, isNodeOfType, isSyntaxNode, stringProperty, type SyntaxNode } from "./syntaxNode.js";

/** The node fields these checks read. Any value is accepted and read structurally. */
export type PredicateNode = {
  readonly type: string;
  readonly name?: string;
  readonly operator?: string;
  readonly computed?: boolean;
  readonly optional?: boolean;
  readonly object?: PredicateNode;
  readonly property?: PredicateNode;
  readonly callee?: PredicateNode;
  readonly arguments?: readonly PredicateNode[];
  readonly argument?: PredicateNode;
  readonly left?: PredicateNode;
  readonly right?: PredicateNode;
  readonly expression?: PredicateNode;
  readonly test?: PredicateNode;
  readonly consequent?: PredicateNode;
  readonly alternate?: PredicateNode;
  readonly value?: unknown;
  readonly regex?: unknown;
};

export type GuardNames = {
  readonly nullish: readonly string[];
  readonly presence: readonly string[];
};

type GuardDecision = {
  readonly guardedPath: string;
  readonly establishesPresence: boolean;
};

type GuardCall = {
  readonly name: string;
  readonly guardedPath: string;
};

const comparisonOperators: readonly string[] = ["===", "!==", "<", "<=", ">", ">="];

export const isStructuralGuardCondition = (condition: unknown, guards: GuardNames): boolean => {
  if (!isNodeOfType(condition, "LogicalExpression")) return false;
  const decision = getGuardDecision(condition.left, guards);
  if (decision === undefined) return false;
  const hasGuardPolarity = presenceRequiredBy(condition.operator) === decision.establishesPresence;
  return hasGuardPolarity && isPropertyCheck(condition.right, decision.guardedPath);
};

export const isGuardedNullishFallback = (condition: unknown, guards: GuardNames): boolean => {
  if (!isNodeOfType(condition, "ConditionalExpression")) return false;
  const decision = getGuardDecision(condition.test, guards);
  if (decision === undefined) return false;
  const presentBranch = decision.establishesPresence ? condition.consequent : condition.alternate;
  return getPropertyPath(presentBranch) === decision.guardedPath;
};

/** && needs a guard that establishes presence; || needs one that establishes absence. */
const presenceRequiredBy = (operator: unknown): boolean | undefined => {
  switch (operator) {
    case "&&":
      return true;
    case "||":
      return false;
    default:
      return undefined;
  }
};

const isNegation = (node: unknown): node is SyntaxNode => isNodeOfType(node, "UnaryExpression") && node.operator === "!";

const isDirectCall = (node: unknown): node is SyntaxNode => isNodeOfType(node, "CallExpression") && node.optional !== true;

/** A direct call of a named function with one property-path argument, such as isNullish(project.owner). */
const getGuardCall = (node: unknown): GuardCall | undefined => {
  const callee = childNode(node, "callee");
  const guardArguments = childNodes(node, "arguments");
  const name = isNodeOfType(callee, "Identifier") ? stringProperty(callee, "name") : undefined;
  const guardedPath = guardArguments.length === 1 ? getPropertyPath(guardArguments[0]) : undefined;
  const isGuardCall = isDirectCall(node) && name !== undefined && guardedPath !== undefined;
  return isGuardCall ? { name, guardedPath } : undefined;
};

const getGuardDecision = (condition: unknown, guards: GuardNames): GuardDecision | undefined => {
  const isNegated = isNegation(condition);
  const guardCall = getGuardCall(isNegated ? condition.argument : condition);
  if (guardCall === undefined) return undefined;
  const isNullishGuard = guards.nullish.includes(guardCall.name);
  const isPresenceGuard = guards.presence.includes(guardCall.name);
  if (isNullishGuard === isPresenceGuard) return undefined;
  return { guardedPath: guardCall.guardedPath, establishesPresence: isNullishGuard ? isNegated : !isNegated };
};

/** A non-computed, non-optional access of a named property, such as project.status. */
const isNamedPropertyAccess = (node: unknown): node is SyntaxNode => {
  return isNodeOfType(node, "MemberExpression") && node.computed === false && node.optional !== true &&
    isNodeOfType(node.property, "Identifier");
};

const getPropertyPath = (node: unknown): string | undefined => {
  if (isNodeOfType(node, "Identifier")) return stringProperty(node, "name");
  if (!isNamedPropertyAccess(node)) return undefined;
  const parentPath = getPropertyPath(node.object);
  const propertyName = stringProperty(node.property, "name");
  const hasPath = parentPath !== undefined && propertyName !== undefined;
  return hasPath ? `${parentPath}.${propertyName}` : undefined;
};

const isComparison = (node: unknown): node is SyntaxNode => {
  return isNodeOfType(node, "BinaryExpression") && comparisonOperators.includes(stringProperty(node, "operator") ?? "");
};

const isPropertyCheck = (node: unknown, guardedPath: string): boolean => {
  if (isNegation(node)) return isGuardedProperty(node.argument, guardedPath);
  if (isComparison(node)) return isGuardedComparison(node, guardedPath);
  return isGuardedProperty(node, guardedPath);
};

const isGuardedComparison = ({ left, right }: SyntaxNode, guardedPath: string): boolean => {
  return (isGuardedProperty(left, guardedPath) && isLiteralOrConstant(right)) ||
    (isLiteralOrConstant(left) && isGuardedProperty(right, guardedPath));
};

const isGuardedProperty = (node: unknown, guardedPath: string): boolean => {
  const propertyPath = getPropertyPath(node);
  return propertyPath !== undefined && propertyPath.startsWith(`${guardedPath}.`);
};

const isLiteralOrConstant = (node: unknown): boolean => {
  if (!isSyntaxNode(node)) return false;
  switch (node.type) {
    case "Literal":
      return node.regex === undefined;
    case "Identifier":
      return /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(stringProperty(node, "name") ?? "");
    case "UnaryExpression":
      return isSignedNumber(node);
    default:
      return false;
  }
};

const isSignedNumber = (node: SyntaxNode): boolean => {
  const argument = childNode(node, "argument");
  return (node.operator === "-" || node.operator === "+") && isNodeOfType(argument, "Literal") &&
    typeof argument.value === "number";
};
