import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not assign true or false to a binding inside a branch to keep a flag for
later. Extra statements do not make that assignment acceptable. Return the
boolean result now, or use the original predicate directly. A genuinely new
boolean computation may be named, but do not create a synonymous binding.

Good: if (shouldEnable) { startSynchronization(); }
Bad: if (shouldEnable) { isEnabled = true; startSynchronization(); }
Also bad under no-binding-alias: const isEnabled = shouldEnable;

Boolean data passed to a state setter remains allowed: setIsEnabled(true)
is not a binding assignment. Meaningful exception-first boolean returns also
remain allowed. This rule checks direct binding assignments in if/switch/
ternary branches, stopping at deferred function boundaries. It is not a full
implementation of the separate immutability policy.

A result flag adds mutable state that a later change can corrupt and hides
that the operation is computing a decision.
`.trim();
const isInBranch = (node) => {
    let child = node;
    let parent = node.parent;
    while (parent !== undefined && parent !== null) {
        if (["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"].includes(parent.type)) {
            if (parent.parent?.type !== "CallExpression" || parent.parent.callee !== parent)
                return false;
        }
        if (parent.type === "SwitchCase" && parent.test !== child)
            return true;
        if (parent.type === "IfStatement" && parent.test !== child)
            return true;
        if (parent.type === "ConditionalExpression" && parent.test !== child)
            return true;
        child = parent;
        parent = parent.parent;
    }
    return false;
};
const implementation = {
    meta: {
        type: "suggestion", docs: { description: DESCRIPTION }, schema: [],
        messages: {
            booleanAssignment: "Do not keep a boolean result by assigning a flag in a branch. Use or return the predicate directly, without a synonymous alias. See rule no-boolean-assignment-branches.",
        },
    },
    create(context) {
        return {
            AssignmentExpression(node) {
                if (node.operator !== "=" || node.left.type !== "Identifier")
                    return;
                if (node.right.type !== "Literal" || typeof node.right.value !== "boolean")
                    return;
                if (isInBranch(node))
                    context.report({ node, messageId: "booleanAssignment" });
            },
        };
    },
};
export const noBooleanAssignmentBranchesRule = defineRule({
    id: "no-boolean-assignment-branches",
    title: "Do not assign boolean literals in branches",
    description: DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=noBooleanAssignmentBranches.rule.js.map