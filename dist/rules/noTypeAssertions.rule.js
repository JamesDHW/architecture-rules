import { defineRule } from "../core/defineRule.js";
import { childNode, isNodeOfType } from "./syntaxNode.js";
const DESCRIPTION = `
Do not use unchecked type assertions in application code. Type-preserving
constructs such as as const and satisfies remain allowed.

A chained assertion such as value as unknown as Project is reported once.
When a dependency's declarations lag its runtime, add a .d.ts augmentation
instead of asserting. Otherwise use a reasoned line suppression.

Escape hatches move type errors away from their cause and make readers trust
claims the compiler cannot verify.
`.trim();
const isConstKeyword = (typeAnnotation) => {
    if (typeAnnotation.type === "TSConstKeyword") {
        return true;
    }
    if (typeAnnotation.type !== "TSTypeReference") {
        return false;
    }
    const typeName = childNode(typeAnnotation, "typeName");
    return isNodeOfType(typeName, "Identifier") && typeName.name === "const";
};
const isConstAssertion = (node) => {
    const typeAnnotation = childNode(node, "typeAnnotation");
    return typeAnnotation !== undefined && isConstKeyword(typeAnnotation);
};
const isAssertionType = (type) => type === "TSAsExpression" || type === "TSTypeAssertion";
/** value as unknown as Project is one escape hatch: report it once, at the outermost cast. */
const isInsideAssertion = ({ parent }) => {
    return parent !== null && isAssertionType(parent.type) && !isConstAssertion(parent);
};
const isReportedAssertion = (node) => !isConstAssertion(node) && !isInsideAssertion(node);
const reportUnlessConstAssertion = (context, node) => {
    if (!isReportedAssertion(node)) {
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