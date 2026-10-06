import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { isBranchTest, isDeferredFunction } from "./nodeContext.js";

const DESCRIPTION = `
Conditions must compute a decision without performing effects. Reject explicit
assignment, update, delete, await, yield, construction, and comma sequencing
inside if/loop/ternary tests, switch discriminants/case tests, and short-circuit
boolean expressions. Calls and
getters are presumed pure by this syntax check, not proven pure. Do not hide
an effect in a called predicate just to bypass the rule.

Good: const project = await loadProject(); if (isNullish(project)) return unavailable;
Bad: if ((project = loadProject()) !== undefined) { publishProject(project); }
Bad: if (await hasProjectAccess()) { publishProject(project); }

Move effectful acquisition before the decision. Function bodies created in a
condition execute later and are not checked as immediate effects; directly
invoked function bodies are checked. No automatic rewrite changes evaluation
order. Explicit effects in logical default expressions are also rejected;
ordinary value-producing fallback calls remain allowed.
`.trim();

const isEffect = (node: Rule.Node): boolean => {
  if (node.type === "UnaryExpression") return node.operator === "delete";
  return ["AssignmentExpression", "UpdateExpression", "AwaitExpression", "YieldExpression", "NewExpression", "SequenceExpression"].includes(node.type);
};

/** True when the parent of node evaluates node as a decision. */
const isDecision = (node: Rule.Node): boolean => {
  const { parent } = node;
  const isSwitchDecision = (parent?.type === "SwitchStatement" && parent.discriminant === node) ||
    (parent?.type === "SwitchCase" && parent.test === node);
  return parent?.type === "LogicalExpression" || isSwitchDecision || isBranchTest(node);
};

/** True when node is the outermost effect in a condition; nested effects are reported once, through it. */
const isInsideCondition = (node: Rule.Node): boolean => {
  const { parent } = node;
  if (parent === null) return false;
  const endsSearch = isEffect(parent) || isDeferredFunction(parent);
  return !endsSearch && (isDecision(node) || isInsideCondition(parent));
};

const isConditionEffect = (node: Rule.Node): boolean => isEffect(node) && isInsideCondition(node);

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: { effect: "Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions." },
  },
  create(context) {
    const check = (node: Rule.Node): void => {
      if (!isConditionEffect(node)) return;
      context.report({ node, messageId: "effect" });
    };
    return {
      AssignmentExpression: check,
      UpdateExpression: check,
      AwaitExpression: check,
      YieldExpression: check,
      NewExpression: check,
      SequenceExpression: check,
      UnaryExpression: check,
    };
  },
};

export const pureConditionsRule = defineRule({
  id: "pure-conditions",
  title: "Keep conditions free of explicit effects",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
