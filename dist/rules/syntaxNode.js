import { isRecord, isString, isUnknownArray } from "../core/guards.js";
export const isSyntaxNode = (value) => isRecord(value) && isString(value.type);
export const isNodeOfType = (value, type) => isSyntaxNode(value) && value.type === type;
/** The child node stored under key, when there is one. */
export const childNode = (node, key) => {
    if (!isRecord(node))
        return undefined;
    const child = node[key];
    return isSyntaxNode(child) ? child : undefined;
};
/** The child nodes stored under key, ignoring holes and non-node entries. */
export const childNodes = (node, key) => {
    if (!isRecord(node))
        return [];
    const children = node[key];
    return isUnknownArray(children) ? children.filter(isSyntaxNode) : [];
};
export const stringProperty = (node, key) => {
    if (!isRecord(node))
        return undefined;
    const value = node[key];
    return isString(value) ? value : undefined;
};
/** The name of an Identifier node; undefined for any other node. */
export const identifierName = (node) => {
    return isNodeOfType(node, "Identifier") ? stringProperty(node, "name") : undefined;
};
/** Every direct child node, excluding the parent back-reference. */
export const directChildren = (node) => {
    return Object.entries(node)
        .filter(([key]) => key !== "parent")
        .flatMap(([, value]) => isUnknownArray(value) ? value.filter(isSyntaxNode) : [value].filter(isSyntaxNode));
};
const isPosition = (value) => {
    return isRecord(value) && typeof value.line === "number" && typeof value.column === "number";
};
const isSourceLocation = (value) => {
    return isRecord(value) && isPosition(value.start) && isPosition(value.end);
};
/** Report position for a structurally read node: context.report({ loc: locationOf(node), ... }). */
export const locationOf = (node) => {
    return isSourceLocation(node.loc) ? node.loc : undefined;
};
//# sourceMappingURL=syntaxNode.js.map