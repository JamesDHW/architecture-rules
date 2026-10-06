export const isFunctionNode = (node) => {
    return node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression";
};
const isInvokedWhereWritten = (node) => {
    return node.parent?.type === "CallExpression" && node.parent.callee === node;
};
/** A function whose body runs later, unlike an immediately invoked function expression. */
export const isDeferredFunction = (node) => isFunctionNode(node) && !isInvokedWhereWritten(node);
/** The nearest function at or above node. */
export const findEnclosingFunction = (node) => {
    if (node === null)
        return undefined;
    return isFunctionNode(node) ? node : findEnclosingFunction(node.parent);
};
/** True when node is the test of an if statement, a classic loop or a ternary. */
export const isBranchTest = (node) => {
    const { parent } = node;
    const isBranch = parent?.type === "IfStatement" || parent?.type === "WhileStatement" || parent?.type === "DoWhileStatement" ||
        parent?.type === "ForStatement" || parent?.type === "ConditionalExpression";
    return isBranch && parent.test === node;
};
//# sourceMappingURL=nodeContext.js.map