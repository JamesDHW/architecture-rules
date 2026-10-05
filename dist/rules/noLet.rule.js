import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not declare variables with let. Declare every binding with const and compute
a new value instead of reassigning an old one.

Good: const visibleProjects = projects.filter(isVisible);
Bad:  let count = 0; count += 1;

State that must outlive a function call lives in a *.state.ts module (see rule
no-captured-mutation). One-time platform signals such as AbortSignal and Promise
replace flags and counters that would otherwise need reassignment.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: {
            noLet: "Declare this with const and compute a new value instead of reassigning. Long-lived state belongs in a *.state.ts module. See rule no-let.",
        },
    },
    create(context) {
        return {
            VariableDeclaration(node) {
                if (node.kind !== "let")
                    return;
                context.report({ node, messageId: "noLet" });
            },
        };
    },
};
export const noLetRule = defineRule({
    id: "no-let",
    title: "Declare every binding with const",
    description: DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=noLet.rule.js.map