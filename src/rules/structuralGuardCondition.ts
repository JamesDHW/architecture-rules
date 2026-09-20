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

export const isStructuralGuardCondition = (
  condition: PredicateNode,
  guards: GuardNames,
): boolean => {
  if (condition.type !== "LogicalExpression") return false;
  if (condition.operator !== "&&" && condition.operator !== "||") return false;
  if (condition.left === undefined || condition.right === undefined) return false;

  const decision = getGuardDecision(condition.left, guards);
  if (decision === undefined) return false;
  if ((condition.operator === "&&") !== decision.establishesPresence) return false;
  return isPropertyCheck(condition.right, decision.guardedPath);
};

export const isGuardedNullishFallback = (condition: PredicateNode, guards: GuardNames): boolean => {
  if (condition.type !== "ConditionalExpression" || condition.test === undefined) return false;
  const decision = getGuardDecision(condition.test, guards);
  if (decision === undefined) return false;
  const presentBranch = decision.establishesPresence ? condition.consequent : condition.alternate;
  return getPropertyPath(presentBranch) === decision.guardedPath;
};

const getGuardDecision = (condition: PredicateNode, guards: GuardNames): {
  readonly guardedPath: string;
  readonly establishesPresence: boolean;
} | undefined => {
  const isNegated = condition.type === "UnaryExpression" && condition.operator === "!";
  const guard = isNegated ? condition.argument : condition;
  if (guard?.type !== "CallExpression" || guard.optional === true) return undefined;
  if (guard.callee?.type !== "Identifier" || guard.callee.name === undefined) return undefined;
  if (guard.arguments?.length !== 1) return undefined;
  const guardedPath = getPropertyPath(guard.arguments[0]);
  if (guardedPath === undefined) return undefined;

  const isNullishGuard = guards.nullish.includes(guard.callee.name);
  const isPresenceGuard = guards.presence.includes(guard.callee.name);
  if (isNullishGuard === isPresenceGuard) return undefined;
  return { guardedPath, establishesPresence: isNullishGuard ? isNegated : !isNegated };
};

const getPropertyPath = (node: PredicateNode | undefined): string | undefined => {
  if (node?.type === "Identifier") return node.name;
  if (node?.type !== "MemberExpression" || node.computed !== false || node.optional === true) return undefined;
  if (node.property?.type !== "Identifier") return undefined;
  const parentPath = getPropertyPath(node.object);
  if (parentPath === undefined) return undefined;
  return `${parentPath}.${node.property.name}`;
};

const isPropertyCheck = (node: PredicateNode, guardedPath: string): boolean => {
  if (isGuardedProperty(node, guardedPath)) return true;
  if (node.type === "UnaryExpression" && node.operator === "!" && node.argument !== undefined) {
    return isGuardedProperty(node.argument, guardedPath);
  }
  if (node.type !== "BinaryExpression" || node.left === undefined || node.right === undefined) return false;
  if (!["===", "!==", "<", "<=", ">", ">="].includes(node.operator ?? "")) return false;
  return (isGuardedProperty(node.left, guardedPath) && isLiteralOrConstant(node.right)) ||
    (isLiteralOrConstant(node.left) && isGuardedProperty(node.right, guardedPath));
};

const isGuardedProperty = (node: PredicateNode, guardedPath: string): boolean => {
  const propertyPath = getPropertyPath(node);
  return propertyPath !== undefined && propertyPath.startsWith(`${guardedPath}.`);
};

const isLiteralOrConstant = (node: PredicateNode): boolean => {
  if (node.type === "Literal") return node.regex === undefined;
  if (node.type === "Identifier") return /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(node.name ?? "");
  return node.type === "UnaryExpression" && (node.operator === "-" || node.operator === "+") &&
    node.argument?.type === "Literal" && typeof node.argument.value === "number";
};
