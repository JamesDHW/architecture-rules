import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not hide simple && or || operations in nested if blocks unless those ifs
share a prefix that would otherwise be duplicated.

A nested if whose only body is another if should be combined with && and
assigned to a named predicate.
`.trim();
const asLoose = (node) => node;
const getSoleStatement = (statement) => {
    if (statement.type !== "BlockStatement") {
        return statement;
    }
    if (statement.body === undefined || statement.body.length !== 1) {
        return undefined;
    }
    return statement.body[0];
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            collapsibleIf: "Combine nested ifs with && and assign the result to a named predicate. See rule no-collapsible-if.",
        },
    },
    create(context) {
        return {
            IfStatement(node) {
                if (node.alternate !== null) {
                    return;
                }
                const inner = getSoleStatement(asLoose(node.consequent));
                if (inner === undefined || inner.type !== "IfStatement") {
                    return;
                }
                if (inner.alternate !== null && inner.alternate !== undefined) {
                    return;
                }
                context.report({
                    node,
                    messageId: "collapsibleIf",
                });
            },
        };
    },
};
export const noCollapsibleIfRule = defineRule({
    id: "no-collapsible-if",
    title: "Do not nest a sole if inside another if",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=noCollapsibleIf.rule.js.map