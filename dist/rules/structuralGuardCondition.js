import { childNode, childNodes, isNodeOfType, isSyntaxNode, stringProperty } from "./syntaxNode.js";
const comparisonOperators = ["===", "!==", "<", "<=", ">", ">="];
export const isStructuralGuardCondition = (condition, guards) => {
    if (!isNodeOfType(condition, "LogicalExpression"))
        return false;
    const decision = getGuardDecision(condition.left, guards);
    if (decision === undefined)
        return false;
    const hasGuardPolarity = presenceRequiredBy(condition.operator) === decision.establishesPresence;
    return hasGuardPolarity && isPropertyCheck(condition.right, decision.guardedPath);
};
export const isGuardedNullishFallback = (condition, guards) => {
    if (!isNodeOfType(condition, "ConditionalExpression"))
        return false;
    const decision = getGuardDecision(condition.test, guards);
    if (decision === undefined)
        return false;
    const presentBranch = decision.establishesPresence ? condition.consequent : condition.alternate;
    return getPropertyPath(presentBranch) === decision.guardedPath;
};
/** && needs a guard that establishes presence; || needs one that establishes absence. */
const presenceRequiredBy = (operator) => {
    switch (operator) {
        case "&&":
            return true;
        case "||":
            return false;
        default:
            return undefined;
    }
};
const isNegation = (node) => isNodeOfType(node, "UnaryExpression") && node.operator === "!";
const isDirectCall = (node) => isNodeOfType(node, "CallExpression") && node.optional !== true;
/** A direct call of a named function with one property-path argument, such as isNullish(project.owner). */
const getGuardCall = (node) => {
    const callee = childNode(node, "callee");
    const guardArguments = childNodes(node, "arguments");
    const name = isNodeOfType(callee, "Identifier") ? stringProperty(callee, "name") : undefined;
    const guardedPath = guardArguments.length === 1 ? getPropertyPath(guardArguments[0]) : undefined;
    const isGuardCall = isDirectCall(node) && name !== undefined && guardedPath !== undefined;
    return isGuardCall ? { name, guardedPath } : undefined;
};
const getGuardDecision = (condition, guards) => {
    const isNegated = isNegation(condition);
    const guardCall = getGuardCall(isNegated ? condition.argument : condition);
    if (guardCall === undefined)
        return undefined;
    const isNullishGuard = guards.nullish.includes(guardCall.name);
    const isPresenceGuard = guards.presence.includes(guardCall.name);
    if (isNullishGuard === isPresenceGuard)
        return undefined;
    return { guardedPath: guardCall.guardedPath, establishesPresence: isNullishGuard ? isNegated : !isNegated };
};
/** A non-computed, non-optional access of a named property, such as project.status. */
const isNamedPropertyAccess = (node) => {
    return isNodeOfType(node, "MemberExpression") && node.computed === false && node.optional !== true &&
        isNodeOfType(node.property, "Identifier");
};
const getPropertyPath = (node) => {
    if (isNodeOfType(node, "Identifier"))
        return stringProperty(node, "name");
    if (!isNamedPropertyAccess(node))
        return undefined;
    const parentPath = getPropertyPath(node.object);
    const propertyName = stringProperty(node.property, "name");
    const hasPath = parentPath !== undefined && propertyName !== undefined;
    return hasPath ? `${parentPath}.${propertyName}` : undefined;
};
const isComparison = (node) => {
    return isNodeOfType(node, "BinaryExpression") && comparisonOperators.includes(stringProperty(node, "operator") ?? "");
};
const isPropertyCheck = (node, guardedPath) => {
    if (isNegation(node))
        return isGuardedProperty(node.argument, guardedPath);
    if (isComparison(node))
        return isGuardedComparison(node, guardedPath);
    return isGuardedProperty(node, guardedPath);
};
const isGuardedComparison = ({ left, right }, guardedPath) => {
    return (isGuardedProperty(left, guardedPath) && isLiteralOrConstant(right)) ||
        (isLiteralOrConstant(left) && isGuardedProperty(right, guardedPath));
};
const isGuardedProperty = (node, guardedPath) => {
    const propertyPath = getPropertyPath(node);
    return propertyPath !== undefined && propertyPath.startsWith(`${guardedPath}.`);
};
const isLiteralOrConstant = (node) => {
    if (!isSyntaxNode(node))
        return false;
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
const isSignedNumber = (node) => {
    const argument = childNode(node, "argument");
    return (node.operator === "-" || node.operator === "+") && isNodeOfType(argument, "Literal") &&
        typeof argument.value === "number";
};
//# sourceMappingURL=structuralGuardCondition.js.map