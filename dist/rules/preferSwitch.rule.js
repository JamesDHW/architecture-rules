import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Use a switch for adjacent terminal decisions comparing the same value with
strict equality. Each branch must directly return or throw, optionally after
other statements. Independent effectful if statements are not alternatives:
combining them can change execution count or the value tested later.

This syntax check does not prove a closed union or stable property reads.
Value-only mappings may instead use an exhaustive readonly record. It does
not enforce records or replace React render-state guard returns. Branches
containing JSX are left to the component-state convention.
`.trim();
const asLoose = (node) => node;
const asLooseList = (nodes) => {
    return nodes;
};
const isDiscriminant = (node) => {
    if (node.type === "Identifier")
        return true;
    return node.type === "MemberExpression" && node.computed === false &&
        node.object !== undefined && isDiscriminant(node.object);
};
const isCaseValue = (node) => {
    return node.type === "Literal" || node.type === "Identifier";
};
const getEqualityDiscriminantKey = (test, sourceCode) => {
    if (test.type !== "BinaryExpression") {
        return undefined;
    }
    if (test.operator !== "===") {
        return undefined;
    }
    const { left, right } = test;
    if (left === undefined || right === undefined) {
        return undefined;
    }
    if (left.type === "MemberExpression" && isDiscriminant(left) && isCaseValue(right)) {
        return sourceCode.getText(left);
    }
    if (right.type === "MemberExpression" && isDiscriminant(right) && isCaseValue(left)) {
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
const containsJsx = (node, context) => {
    const fields = node;
    const type = fields["type"];
    if (type === "JSXElement" || type === "JSXFragment")
        return true;
    if (typeof type !== "string")
        return false;
    return (context.sourceCode.visitorKeys[type] ?? []).some((key) => {
        const child = fields[key];
        if (Array.isArray(child)) {
            return child.some((entry) => entry !== null && typeof entry === "object" && containsJsx(entry, context));
        }
        return child !== null && typeof child === "object" && containsJsx(child, context);
    });
};
const hasTerminalConsequent = (node) => {
    const branch = node.consequent;
    if (branch === undefined)
        return false;
    const last = branch.type === "BlockStatement" ? branch.body?.at(-1) : branch;
    return last?.type === "ReturnStatement" || last?.type === "ThrowStatement";
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
            preferSwitch: "Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.",
        },
    },
    create(context) {
        const reported = new Set();
        const reportChain = (nodes) => {
            if (!nodes.every(hasTerminalConsequent))
                return;
            if (nodes.some((node) => containsJsx(node, context)))
                return;
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