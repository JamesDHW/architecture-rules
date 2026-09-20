import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not leave empty or comment-only conditional branches. Remove the meaningless
decision or express an exhaustive no-op with a terminal return. Framework-required
empty function stubs are outside this rule. Stacked switch labels remain allowed
because they select the following terminal body.

Good: if (shouldNotifyProjectOwner) { notifyProjectOwner(); }
Good: case "idle": return;
Bad: if (isProjectArchived) { /* Intentionally do nothing. */ }

Comments do not turn an empty conditional into meaningful executable behavior.
Do not introduce a dummy statement or helper merely to evade this rule.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: { empty: "Remove this empty branch; comments do not make a no-op meaningful. Use return for an exhaustive no-op case. See rule no-empty-branches." },
    },
    create(context) {
        return {
            IfStatement(node) {
                for (const branch of [node.consequent, node.alternate]) {
                    if (branch === null || branch === undefined)
                        continue;
                    if (branch.type !== "EmptyStatement" && !(branch.type === "BlockStatement" && branch.body.length === 0))
                        continue;
                    context.report({ node: branch, messageId: "empty" });
                }
            },
            SwitchStatement(node) {
                if (node.cases.length === 0)
                    context.report({ node, messageId: "empty" });
            },
        };
    },
};
export const emptyBranchesRule = defineRule({
    id: "no-empty-branches",
    title: "Remove empty conditional branches",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=emptyBranches.rule.js.map