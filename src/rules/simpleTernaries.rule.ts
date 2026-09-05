import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Use a ternary for one simple value choice. Do not nest ternaries or use
assignments, updates, delete, await, yield, construction, or comma sequences
in its branches. Calls are allowed: this syntax check does not prove that
calls or property getters are pure. Purity of called operations remains a
separate architectural obligation. No arbitrary expression-length limit is
used as a proxy for understandability.

Bodies of functions created inside a branch execute later and are not checked
as branch effects. Immediately invoked function bodies are checked.
`.trim();

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    messages: {
      nested: "Use explicit control flow instead of nested ternaries. See rule simple-ternaries.",
      effect: "Move this explicit effect or sequence out of the ternary branch. See rule simple-ternaries. Calls are allowed but their purity is not proven.",
    },
    schema: [],
  },
  create(context) {
    const findEnclosingChoice = (node: Rule.Node): Rule.Node | undefined => {
      let child = node;
      let parent: Rule.Node | null | undefined = node.parent;
      while (parent !== undefined && parent !== null) {
        if (parent.type === "ArrowFunctionExpression" || parent.type === "FunctionExpression" || parent.type === "FunctionDeclaration") {
          if (parent.parent?.type !== "CallExpression" || parent.parent.callee !== parent) return undefined;
        }
        if (parent.type === "ConditionalExpression" && parent.test !== child) return parent;
        child = parent;
        parent = parent.parent;
      }
      return undefined;
    };

    const reportEffect = (node: Rule.Node): void => {
      if (findEnclosingChoice(node) === undefined) return;
      context.report({ node, messageId: "effect" });
    };

    return {
      ConditionalExpression(node) {
        let parent: Rule.Node | null | undefined = node.parent;
        while (parent !== undefined && parent !== null) {
          if (parent.type === "ArrowFunctionExpression" || parent.type === "FunctionExpression" || parent.type === "FunctionDeclaration") return;
          if (parent.type === "ConditionalExpression") {
            context.report({ node, messageId: "nested" });
            return;
          }
          parent = parent.parent;
        }
      },
      AssignmentExpression: reportEffect,
      UpdateExpression: reportEffect,
      AwaitExpression: reportEffect,
      YieldExpression: reportEffect,
      NewExpression: reportEffect,
      SequenceExpression: reportEffect,
      UnaryExpression(node) {
        if (node.operator === "delete") reportEffect(node);
      },
    };
  },
};

export const simpleTernariesRule = defineRule({
  id: "simple-ternaries",
  title: "Keep ternaries simple and side-effect-free",
  description: DESCRIPTION,
  enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
