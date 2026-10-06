import { isPresent } from "../core/guards.js";
import { childNode, childNodes, isNodeOfType, isSyntaxNode } from "./syntaxNode.js";
const isDiscriminant = (node) => {
    if (isNodeOfType(node, "Identifier"))
        return true;
    return isNodeOfType(node, "MemberExpression") && node.computed === false && isDiscriminant(node.object);
};
const isCaseValue = (node) => isNodeOfType(node, "Literal") || isNodeOfType(node, "Identifier");
const comparesDiscriminant = ({ subject, value }) => isDiscriminant(subject) && isCaseValue(value);
const comparesMemberDiscriminant = (comparison) => {
    return comparison.subject.type === "MemberExpression" && comparesDiscriminant(comparison);
};
/** The source text of the value an if compares with ===, preferring member paths, then the left side. */
const getDiscriminantKey = (node, sourceCode) => {
    const { test } = node;
    const isStrictEquality = test.type === "BinaryExpression" && test.operator === "===";
    if (!isStrictEquality)
        return undefined;
    const comparisons = [{ subject: test.left, value: test.right }, { subject: test.right, value: test.left }];
    const discriminant = comparisons.find(comparesMemberDiscriminant) ?? comparisons.find(comparesDiscriminant);
    return discriminant === undefined ? undefined : sourceCode.getText(discriminant.subject);
};
const childrenUnder = (node, key) => {
    return [childNode(node, key), ...childNodes(node, key)].filter(isPresent);
};
const containsJsx = (node, visitorKeys) => {
    if (!isSyntaxNode(node))
        return false;
    const isJsx = node.type === "JSXElement" || node.type === "JSXFragment";
    return isJsx || (visitorKeys[node.type] ?? []).some((key) => {
        return childrenUnder(node, key).some((child) => containsJsx(child, visitorKeys));
    });
};
const hasTerminalConsequent = ({ consequent }) => {
    const last = consequent.type === "BlockStatement" ? consequent.body.at(-1) : consequent;
    return last?.type === "ReturnStatement" || last?.type === "ThrowStatement";
};
const allShareDiscriminant = (nodes, sourceCode) => {
    const keys = nodes.map((node) => getDiscriminantKey(node, sourceCode));
    const [first] = keys;
    return keys.length >= 2 && first !== undefined && keys.every((key) => key === first);
};
/** The first if of a run that a switch should replace, when the whole run qualifies. */
export const getSwitchCandidateHead = (nodes, sourceCode) => {
    const isSwitchCandidate = nodes.every(hasTerminalConsequent) &&
        !nodes.some((node) => containsJsx(node, sourceCode.visitorKeys)) &&
        allShareDiscriminant(nodes, sourceCode);
    return isSwitchCandidate ? nodes[0] : undefined;
};
/** An if followed by its else-if chain. */
export const collectChainIfs = (node) => {
    return node.alternate?.type === "IfStatement" ? [node, ...collectChainIfs(node.alternate)] : [node];
};
const getStandaloneIfKey = (statement, sourceCode) => {
    const isStandaloneIf = statement.type === "IfStatement" && !isPresent(statement.alternate);
    return isStandaloneIf ? getDiscriminantKey(statement, sourceCode) : undefined;
};
const continuesRun = (keys, index) => {
    const key = keys[index];
    return key !== undefined && key === keys[index - 1];
};
/** Maximal runs of two or more adjacent else-free ifs that compare the same discriminant. */
export const collectConsecutiveIfRuns = (statements, sourceCode) => {
    const keys = statements.map((statement) => getStandaloneIfKey(statement, sourceCode));
    const runStarts = [...keys.keys()].filter((index) => !continuesRun(keys, index));
    return runStarts
        .map((start, position) => statements.slice(start, runStarts[position + 1]))
        .map((run) => run.filter((statement) => statement.type === "IfStatement"))
        .filter((run) => run.length >= 2);
};
//# sourceMappingURL=preferSwitchCandidates.js.map