import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Put logical computing in a variable or a pure function returning boolean,
instead of using anonymous logical operations in a condition.

Naming a predicate states the intention, abstracts real-world logic, and
makes the condition composable with other predicates.
`.trim();
const reportIfAnonymousLogical = (context, test) => {
    if (test === null || test === undefined) {
        return;
    }
    if (test.type !== "LogicalExpression") {
        return;
    }
    context.report({
        node: test,
        messageId: "namedPredicate",
    });
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            namedPredicate: "Give this logical condition a name. Assign &&, ||, or ?? to a predicate variable or function. See rule named-predicates.",
        },
    },
    create(context) {
        return {
            IfStatement(node) {
                reportIfAnonymousLogical(context, node.test);
            },
            WhileStatement(node) {
                reportIfAnonymousLogical(context, node.test);
            },
            DoWhileStatement(node) {
                reportIfAnonymousLogical(context, node.test);
            },
            ForStatement(node) {
                reportIfAnonymousLogical(context, node.test);
            },
            ConditionalExpression(node) {
                reportIfAnonymousLogical(context, node.test);
            },
        };
    },
};
export const namedPredicatesRule = defineRule({
    id: "named-predicates",
    title: "Name your predicates",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=namedPredicates.rule.js.map