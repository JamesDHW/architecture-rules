import { defineRule } from "../core/defineRule.js";
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
const isInsideCondition = (node) => {
    let child = node;
    let parent = node.parent;
    while (parent !== null && parent !== undefined) {
        if (["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"].includes(parent.type)) {
            if (parent.parent?.type !== "CallExpression" || parent.parent.callee !== parent)
                return false;
        }
        if (parent.type === "LogicalExpression")
            return true;
        if (parent.type === "SwitchStatement" && parent.discriminant === child)
            return true;
        if (parent.type === "SwitchCase" && parent.test === child)
            return true;
        if ((parent.type === "IfStatement" || parent.type === "WhileStatement" ||
            parent.type === "DoWhileStatement" || parent.type === "ForStatement" ||
            parent.type === "ConditionalExpression") && parent.test === child)
            return true;
        child = parent;
        parent = parent.parent;
    }
    return false;
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: { effect: "Compute effectful work separately, then test its result. Predicates must be pure. See rule pure-conditions." },
    },
    create(context) {
        const check = (node) => {
            if (isInsideCondition(node))
                context.report({ node, messageId: "effect" });
        };
        return {
            AssignmentExpression: check,
            UpdateExpression: check,
            AwaitExpression: check,
            YieldExpression: check,
            NewExpression: check,
            SequenceExpression: check,
            UnaryExpression(node) { if (node.operator === "delete")
                check(node); },
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
//# sourceMappingURL=pureConditions.rule.js.map