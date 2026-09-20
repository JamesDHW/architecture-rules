import type { Rule } from "eslint";

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

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: { grouping: "Parenthesize mixed && and || operations to expose their grouping. See rule grouped-logical-operators." },
  },
  create(context) {
    return {
      LogicalExpression(node) {
        if (node.operator !== "&&" && node.operator !== "||") return;
        for (const child of [node.left, node.right]) {
          if (child.type !== "LogicalExpression" || child.operator === node.operator || child.operator === "??") continue;
          const before = context.sourceCode.getTokenBefore(child as Rule.Node);
          const after = context.sourceCode.getTokenAfter(child as Rule.Node);
          if (before?.value === "(" && after?.value === ")") continue;
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
