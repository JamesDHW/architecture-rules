import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not use else or else if. Handle the special case with an early return,
throw, break, or continue, then write the remaining path at the same level.

An else branch forces the reader to retain the preceding predicate while
following later cases. Guard clauses keep each exit independently visible
and match the shape of exception-first boolean decisions.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            noElse: "Do not use else. Handle the special case, then continue the remaining path. See rule no-else.",
        },
    },
    create(context) {
        return {
            IfStatement(node) {
                if (node.alternate === null || node.alternate === undefined) {
                    return;
                }
                context.report({
                    node: node.alternate,
                    messageId: "noElse",
                });
            },
        };
    },
};
export const noElseRule = defineRule({
    id: "no-else",
    title: "Do not use else",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=noElse.rule.js.map