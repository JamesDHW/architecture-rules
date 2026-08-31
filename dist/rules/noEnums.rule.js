import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not declare TypeScript enums. Represent a closed set with a literal union.
Add an as const object only when runtime access to named values is genuinely
useful.

Literal unions work directly as discriminants, preserve exact serializable
values, and avoid the additional runtime and type semantics of enums.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            noEnums: "Do not declare TypeScript enums. Use a literal union. See rule no-enums.",
        },
    },
    create(context) {
        return {
            TSEnumDeclaration(node) {
                context.report({
                    node,
                    messageId: "noEnums",
                });
            },
        };
    },
};
export const noEnumsRule = defineRule({
    id: "no-enums",
    title: "Use literal unions instead of enums",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=noEnums.rule.js.map