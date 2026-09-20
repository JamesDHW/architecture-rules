export const isStructuralGuardCondition = (condition, guards) => {
    if (condition.type !== "LogicalExpression")
        return false;
    if (condition.operator !== "&&" && condition.operator !== "||")
        return false;
    if (condition.left === undefined || condition.right === undefined)
        return false;
    const decision = getGuardDecision(condition.left, guards);
    if (decision === undefined)
        return false;
    if ((condition.operator === "&&") !== decision.establishesPresence)
        return false;
    return isPropertyCheck(condition.right, decision.guardedPath);
};
export const isGuardedNullishFallback = (condition, guards) => {
    if (condition.type !== "ConditionalExpression" || condition.test === undefined)
        return false;
    const decision = getGuardDecision(condition.test, guards);
    if (decision === undefined)
        return false;
    const presentBranch = decision.establishesPresence ? condition.consequent : condition.alternate;
    return getPropertyPath(presentBranch) === decision.guardedPath;
};
const getGuardDecision = (condition, guards) => {
    const isNegated = condition.type === "UnaryExpression" && condition.operator === "!";
    const guard = isNegated ? condition.argument : condition;
    if (guard?.type !== "CallExpression" || guard.optional === true)
        return undefined;
    if (guard.callee?.type !== "Identifier" || guard.callee.name === undefined)
        return undefined;
    if (guard.arguments?.length !== 1)
        return undefined;
    const guardedPath = getPropertyPath(guard.arguments[0]);
    if (guardedPath === undefined)
        return undefined;
    const isNullishGuard = guards.nullish.includes(guard.callee.name);
    const isPresenceGuard = guards.presence.includes(guard.callee.name);
    if (isNullishGuard === isPresenceGuard)
        return undefined;
    return { guardedPath, establishesPresence: isNullishGuard ? isNegated : !isNegated };
};
const getPropertyPath = (node) => {
    if (node?.type === "Identifier")
        return node.name;
    if (node?.type !== "MemberExpression" || node.computed !== false || node.optional === true)
        return undefined;
    if (node.property?.type !== "Identifier")
        return undefined;
    const parentPath = getPropertyPath(node.object);
    if (parentPath === undefined)
        return undefined;
    return `${parentPath}.${node.property.name}`;
};
const isPropertyCheck = (node, guardedPath) => {
    if (isGuardedProperty(node, guardedPath))
        return true;
    if (node.type === "UnaryExpression" && node.operator === "!" && node.argument !== undefined) {
        return isGuardedProperty(node.argument, guardedPath);
    }
    if (node.type !== "BinaryExpression" || node.left === undefined || node.right === undefined)
        return false;
    if (!["===", "!==", "<", "<=", ">", ">="].includes(node.operator ?? ""))
        return false;
    return (isGuardedProperty(node.left, guardedPath) && isLiteralOrConstant(node.right)) ||
        (isLiteralOrConstant(node.left) && isGuardedProperty(node.right, guardedPath));
};
const isGuardedProperty = (node, guardedPath) => {
    const propertyPath = getPropertyPath(node);
    return propertyPath !== undefined && propertyPath.startsWith(`${guardedPath}.`);
};
const isLiteralOrConstant = (node) => {
    if (node.type === "Literal")
        return node.regex === undefined;
    if (node.type === "Identifier")
        return /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(node.name ?? "");
    return node.type === "UnaryExpression" && (node.operator === "-" || node.operator === "+") &&
        node.argument?.type === "Literal" && typeof node.argument.value === "number";
};
//# sourceMappingURL=structuralGuardCondition.js.map