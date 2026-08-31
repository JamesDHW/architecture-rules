import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Predicates that categorise the same property of a value should be written as
a switch rather than a sequence of if or else if. A switch focuses each case
on the compared value instead of repeating the whole predicate.

Polymorphic dispatch is a further step when the variants own the behaviour;
this rule only asks for switch over repeated equality tests.
`.trim();
const asLoose = (node) => node;
const asLooseList = (nodes) => {
    return nodes;
};
const isDiscriminant = (node) => {
    return node.type === "Identifier" || node.type === "MemberExpression";
};
const isCaseValue = (node) => {
    return node.type === "Literal" || node.type === "Identifier";
};
const getEqualityDiscriminantKey = (test, sourceCode) => {
    if (test.type !== "BinaryExpression") {
        return undefined;
    }
    if (test.operator !== "===" && test.operator !== "==") {
        return undefined;
    }
    const { left, right } = test;
    if (left === undefined || right === undefined) {
        return undefined;
    }
    if (left.type === "MemberExpression" && isCaseValue(right)) {
        return sourceCode.getText(left);
    }
    if (right.type === "MemberExpression" && isCaseValue(left)) {
        return sourceCode.getText(right);
    }
    if (isDiscriminant(left) && isCaseValue(right)) {
        return sourceCode.getText(left);
    }
    if (isDiscriminant(right) && isCaseValue(left)) {
        return sourceCode.getText(right);
    }
    return undefined;
};
const collectChainIfs = (node) => {
    const chain = [node];
    let alternate = node.alternate;
    while (alternate !== null && alternate !== undefined && alternate.type === "IfStatement") {
        chain.push(alternate);
        alternate = alternate.alternate;
    }
    return chain;
};
const discriminantKeyForIf = (node, sourceCode) => {
    if (node.type !== "IfStatement" || node.test === undefined) {
        return undefined;
    }
    return getEqualityDiscriminantKey(node.test, sourceCode);
};
const allShareDiscriminant = (nodes, sourceCode) => {
    const [head] = nodes;
    if (head === undefined || nodes.length < 2) {
        return false;
    }
    const first = discriminantKeyForIf(head, sourceCode);
    if (first === undefined) {
        return false;
    }
    return nodes.every((node) => discriminantKeyForIf(node, sourceCode) === first);
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            preferSwitch: "Replace repeated equality tests on the same value with a switch. See rule prefer-switch.",
        },
    },
    create(context) {
        const reported = new Set();
        const reportChain = (nodes) => {
            if (!allShareDiscriminant(nodes, context.sourceCode)) {
                return;
            }
            const [head] = nodes;
            if (head === undefined || reported.has(head)) {
                return;
            }
            reported.add(head);
            context.report({
                node: head,
                messageId: "preferSwitch",
            });
        };
        const checkConsecutiveIfs = (statements) => {
            let index = 0;
            while (index < statements.length) {
                const statement = statements[index];
                if (statement === undefined || statement.type !== "IfStatement") {
                    index += 1;
                    continue;
                }
                if (statement.alternate !== null && statement.alternate !== undefined) {
                    index += 1;
                    continue;
                }
                const run = [statement];
                let cursor = index + 1;
                const expectedKey = discriminantKeyForIf(statement, context.sourceCode);
                while (cursor < statements.length && expectedKey !== undefined) {
                    const next = statements[cursor];
                    if (next === undefined ||
                        next.type !== "IfStatement" ||
                        (next.alternate !== null && next.alternate !== undefined)) {
                        break;
                    }
                    if (discriminantKeyForIf(next, context.sourceCode) !== expectedKey) {
                        break;
                    }
                    run.push(next);
                    cursor += 1;
                }
                reportChain(run);
                index = cursor;
            }
        };
        return {
            IfStatement(node) {
                if (node.parent.type === "IfStatement" && node.parent.alternate === node) {
                    return;
                }
                reportChain(collectChainIfs(asLoose(node)));
            },
            Program(node) {
                checkConsecutiveIfs(asLooseList(node.body));
            },
            BlockStatement(node) {
                checkConsecutiveIfs(asLooseList(node.body));
            },
            SwitchCase(node) {
                checkConsecutiveIfs(asLooseList(node.consequent));
            },
        };
    },
};
export const preferSwitchRule = defineRule({
    id: "prefer-switch",
    title: "Prefer switch over repeated equality ifs",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=preferSwitch.rule.js.map