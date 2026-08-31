import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not make different branches produce the same result. Extract logic that is
duplicated in each branch to after the branching, or combine the predicates
when the outcomes are identical.

Duplicated branch results hide that the condition does not change what
happens.
`.trim();
const asLoose = (node) => node;
const asLooseList = (nodes) => {
    return nodes;
};
const normalizeText = (sourceCode, node) => {
    return sourceCode.getText(node).replaceAll(/\s+/g, " ").trim();
};
const collectBranchConsequents = (node) => {
    if (node.type !== "IfStatement" || node.consequent === undefined) {
        return [];
    }
    const consequents = [node.consequent];
    let alternate = node.alternate;
    while (alternate !== null && alternate !== undefined) {
        if (alternate.type === "IfStatement") {
            if (alternate.consequent !== undefined) {
                consequents.push(alternate.consequent);
            }
            alternate = alternate.alternate;
            continue;
        }
        consequents.push(alternate);
        break;
    }
    return consequents;
};
const reportDuplicateConsequents = (context, nodes) => {
    const seen = new Map();
    for (const node of nodes) {
        const text = normalizeText(context.sourceCode, node);
        const first = seen.get(text);
        if (first === undefined) {
            seen.set(text, node);
            continue;
        }
        context.report({
            node: node,
            messageId: "sameResult",
        });
    }
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            sameResult: "These branches produce the same result. Combine the predicates or extract the shared outcome. See rule one-path-one-result.",
        },
    },
    create(context) {
        const checkSiblingIfs = (statements) => {
            const consequents = statements.flatMap((statement) => {
                if (statement.type !== "IfStatement") {
                    return [];
                }
                if (statement.alternate !== null && statement.alternate !== undefined) {
                    return [];
                }
                if (statement.consequent === undefined) {
                    return [];
                }
                return [statement.consequent];
            });
            reportDuplicateConsequents(context, consequents);
        };
        return {
            IfStatement(node) {
                if (node.parent.type === "IfStatement" && node.parent.alternate === node) {
                    return;
                }
                if (node.alternate === null) {
                    return;
                }
                reportDuplicateConsequents(context, collectBranchConsequents(asLoose(node)));
            },
            Program(node) {
                checkSiblingIfs(asLooseList(node.body));
            },
            BlockStatement(node) {
                checkSiblingIfs(asLooseList(node.body));
            },
            SwitchCase(node) {
                checkSiblingIfs(asLooseList(node.consequent));
            },
        };
    },
};
export const onePathOneResultRule = defineRule({
    id: "one-path-one-result",
    title: "One path should produce one result",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "warn",
        implementation,
    },
});
//# sourceMappingURL=onePathOneResult.rule.js.map