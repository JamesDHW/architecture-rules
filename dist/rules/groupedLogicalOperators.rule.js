import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Parenthesize mixed && and || operations to make their grouping explicit.
Good: const canEditProject = isAdministrator || (isOwner && isProjectActive);
Bad: const canEditProject = isAdministrator || isOwner && isProjectActive;
A chain using only one logical operator needs no extra parentheses. Do not
require parentheses around every comparison. JavaScript already requires
explicit grouping when mixing ?? with && or ||. This rule applies inside
named predicate implementations as well as at their use sites.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: { grouping: "Parenthesize mixed && and || operations to expose their grouping. See rule grouped-logical-operators." },
    },
    create(context) {
        const isParenthesized = (node) => {
            const before = context.sourceCode.getTokenBefore(node);
            const after = context.sourceCode.getTokenAfter(node);
            return before?.value === "(" && after?.value === ")";
        };
        /** A nested && or || that differs from its parent's operator must show its grouping. */
        const needsGrouping = (child, operator) => {
            return child.type === "LogicalExpression" && child.operator !== operator && child.operator !== "??" && !isParenthesized(child);
        };
        return {
            LogicalExpression(node) {
                if (node.operator === "??")
                    return;
                const ungrouped = [node.left, node.right].filter((child) => needsGrouping(child, node.operator));
                for (const child of ungrouped) {
                    context.report({ node: child, messageId: "grouping" });
                }
            },
        };
    },
};
export const groupedLogicalOperatorsRule = defineRule({
    id: "grouped-logical-operators",
    title: "Expose mixed logical operator precedence",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=groupedLogicalOperators.rule.js.map