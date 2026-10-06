import { defineRule } from "../core/defineRule.js";
import { findEnclosingFunction } from "./nodeContext.js";
import { childNode, childNodes, isNodeOfType, isSyntaxNode } from "./syntaxNode.js";
const DESCRIPTION = `
Do not test or return an inline remainder comparison such as value % n === 0.
Give that check a name, typically isDivisibleBy(value, n).

A named divisibility predicate states the intention and can be reused in
exception-first boolean decisions without repeating arithmetic.
`.trim();
const isNegation = (node) => node.type === "UnaryExpression" && node.operator === "!";
const unwrap = (node) => {
    const argument = isNegation(node) ? childNode(node, "argument") : undefined;
    return argument === undefined ? node : unwrap(argument);
};
const isZeroLiteral = (node) => isNodeOfType(node, "Literal") && node.value === 0;
const isRemainder = (node) => isNodeOfType(node, "BinaryExpression") && node.operator === "%";
const isEqualityComparison = (node) => {
    return node.type === "BinaryExpression" && (node.operator === "===" || node.operator === "!==");
};
const isRemainderZeroComparison = (node) => {
    const comparison = unwrap(node);
    if (!isEqualityComparison(comparison)) {
        return false;
    }
    const left = childNode(comparison, "left");
    const right = childNode(comparison, "right");
    return (isRemainder(left) && isZeroLiteral(right)) || (isZeroLiteral(left) && isRemainder(right));
};
/** True when test is present and compares a remainder with zero; narrows away a missing loop test or return value. */
const isRemainderZeroTest = (test) => {
    return isSyntaxNode(test) && isRemainderZeroComparison(test);
};
const soleReturnArgument = (block) => {
    const [sole, ...others] = childNodes(block, "body");
    const isSoleReturn = others.length === 0 && sole?.type === "ReturnStatement";
    return isSoleReturn ? childNode(sole, "argument") : undefined;
};
/** The expression a function returns when its body is that expression or a single return statement. */
const returnedExpression = (fn) => {
    const body = childNode(fn, "body");
    return body?.type === "BlockStatement" ? soleReturnArgument(body) : body;
};
/** A predicate helper such as isDivisibleBy names the remainder comparison it returns. */
const isInsidePredicateHelper = (node) => {
    const enclosingFunction = findEnclosingFunction(node.parent);
    const returned = enclosingFunction === undefined ? undefined : returnedExpression(enclosingFunction);
    return returned !== undefined && isRemainderZeroComparison(returned);
};
const reportIfRemainderZero = (context, test) => {
    if (!isRemainderZeroTest(test)) {
        return;
    }
    context.report({ node: test, messageId: "namedDivisibility" });
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            namedDivisibility: "Give this divisibility check a name such as isDivisibleBy. See rule named-divisibility.",
        },
    },
    create(context) {
        return {
            IfStatement(node) { reportIfRemainderZero(context, node.test); },
            WhileStatement(node) { reportIfRemainderZero(context, node.test); },
            DoWhileStatement(node) { reportIfRemainderZero(context, node.test); },
            ForStatement(node) { reportIfRemainderZero(context, node.test); },
            ConditionalExpression(node) { reportIfRemainderZero(context, node.test); },
            ReturnStatement(node) {
                const { argument } = node;
                const isUnnamedDivisibility = isRemainderZeroTest(argument) && !isInsidePredicateHelper(node);
                if (isUnnamedDivisibility) {
                    context.report({ node: argument, messageId: "namedDivisibility" });
                }
            },
        };
    },
};
export const namedDivisibilityRule = defineRule({
    id: "named-divisibility",
    title: "Name divisibility checks",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=namedDivisibility.rule.js.map