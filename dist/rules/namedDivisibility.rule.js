import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not test or return an inline remainder comparison such as value % n === 0.
Give that check a name, typically isDivisibleBy(value, n).

A named divisibility predicate states the intention and can be reused in
exception-first boolean decisions without repeating arithmetic.
`.trim();
const asExpression = (node) => node;
const unwrap = (node) => {
    if (node.type === "UnaryExpression" && node.operator === "!") {
        if (node.argument === undefined) {
            return node;
        }
        return unwrap(node.argument);
    }
    return node;
};
const isZeroLiteral = (node) => {
    if (node === undefined || node.type !== "Literal") {
        return false;
    }
    return node.value === 0;
};
const isRemainder = (node) => {
    if (node === undefined || node.type !== "BinaryExpression") {
        return false;
    }
    return node.operator === "%";
};
const isRemainderZeroComparison = (node) => {
    const comparison = unwrap(node);
    if (comparison.type !== "BinaryExpression") {
        return false;
    }
    if (comparison.operator !== "===" && comparison.operator !== "!==") {
        return false;
    }
    return ((isRemainder(comparison.left) && isZeroLiteral(comparison.right)) ||
        (isZeroLiteral(comparison.left) && isRemainder(comparison.right)));
};
const isPredicateHelper = (fn) => {
    const body = fn.body;
    if (body === undefined) {
        return false;
    }
    if (body.type !== "BlockStatement") {
        return isRemainderZeroComparison(body);
    }
    if (body.body === undefined || body.body.length !== 1) {
        return false;
    }
    const [sole] = body.body;
    if (sole === undefined || sole.type !== "ReturnStatement") {
        return false;
    }
    if (sole.argument === undefined || sole.argument === null) {
        return false;
    }
    return isRemainderZeroComparison(sole.argument);
};
const getEnclosingFunction = (node) => {
    let current = node.parent;
    while (current !== null && current !== undefined) {
        if (current.type === "FunctionDeclaration" ||
            current.type === "FunctionExpression" ||
            current.type === "ArrowFunctionExpression") {
            return current;
        }
        current = current.parent;
    }
    return undefined;
};
const reportIfRemainderZero = (context, test) => {
    if (test === null || test === undefined) {
        return;
    }
    if (!isRemainderZeroComparison(asExpression(test))) {
        return;
    }
    context.report({
        node: test,
        messageId: "namedDivisibility",
    });
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
            IfStatement(node) {
                reportIfRemainderZero(context, node.test);
            },
            WhileStatement(node) {
                reportIfRemainderZero(context, node.test);
            },
            DoWhileStatement(node) {
                reportIfRemainderZero(context, node.test);
            },
            ForStatement(node) {
                reportIfRemainderZero(context, node.test);
            },
            ConditionalExpression(node) {
                reportIfRemainderZero(context, node.test);
            },
            ReturnStatement(node) {
                if (node.argument === null || node.argument === undefined) {
                    return;
                }
                if (!isRemainderZeroComparison(asExpression(node.argument))) {
                    return;
                }
                const enclosingFunction = getEnclosingFunction(node);
                if (enclosingFunction !== undefined && isPredicateHelper(enclosingFunction)) {
                    return;
                }
                context.report({
                    node: node.argument,
                    messageId: "namedDivisibility",
                });
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