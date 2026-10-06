/** TypeScript's AST exposes children only through a forEachChild callback, so they are collected here once. */
export const childrenOf = (node) => {
    const children = [];
    // oxlint-disable-next-line architecture/no-array-mutation, architecture/no-captured-mutation -- forEachChild is the only child accessor TypeScript's AST offers.
    node.forEachChild((child) => { children.push(child); });
    return children;
};
/** The node followed by every node beneath it, in source order. */
export const descendants = (node) => [node, ...childrenOf(node).flatMap(descendants)];
//# sourceMappingURL=syntaxTree.js.map