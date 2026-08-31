import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not use unchecked type assertions in application code. Type-preserving
constructs such as as const and satisfies remain allowed.

Escape hatches move type errors away from their cause and make readers trust
claims the compiler cannot verify.
`.trim();
const getTypeAnnotation = (node) => {
    if (!("typeAnnotation" in node)) {
        return undefined;
    }
    const { typeAnnotation } = node;
    return typeAnnotation;
};
const isConstKeyword = (typeAnnotation) => {
    if (typeAnnotation.type === "TSConstKeyword") {
        return true;
    }
    if (typeAnnotation.type !== "TSTypeReference") {
        return false;
    }
    return typeAnnotation.typeName?.type === "Identifier" && typeAnnotation.typeName.name === "const";
};
const reportUnlessConstAssertion = (context, node) => {
    const typeAnnotation = getTypeAnnotation(node);
    if (typeAnnotation !== undefined && isConstKeyword(typeAnnotation)) {
        return;
    }
    context.report({
        node,
        messageId: "noTypeAssertions",
    });
};
const implementation = {
    meta: {
        type: "problem",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            noTypeAssertions: "Do not use type assertions. Prefer validation, narrowing, or as const. See rule no-type-assertions.",
        },
    },
    create(context) {
        return {
            TSAsExpression(node) {
                reportUnlessConstAssertion(context, node);
            },
            TSTypeAssertion(node) {
                reportUnlessConstAssertion(context, node);
            },
        };
    },
};
export const noTypeAssertionsRule = defineRule({
    id: "no-type-assertions",
    title: "Do not use unchecked type assertions",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=noTypeAssertions.rule.js.map