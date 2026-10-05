import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
JSX may pass through an existing callback directly. Any handler that creates
behavior—by adapting arguments, branching, sequencing work, or invoking a
domain operation—must be a descriptively named value outside the JSX.

To bind a row's value, JSX may call a named function when every argument is a
plain value (a name, a property such as connection.id, or a literal):
onClick={handleRemoveClick(connection.id)}. The call cannot hide logic, and
TypeScript requires it to return a handler, so onClick={save()} does not compile.

Named handlers keep JSX focused on describing the interface and give behavior
a searchable name that communicates the user action it implements.
`.trim();
const isHandlerPropName = (name) => {
    return name.startsWith("on") && name.length > 2 && name[2] === name[2]?.toUpperCase();
};
const asJsxAttribute = (node) => {
    return node;
};
/** A name or a property path such as model.handleSave or rows[index]; never a call. */
const isReference = (node) => {
    if (node.type === "Identifier")
        return true;
    if (node.type !== "MemberExpression")
        return false;
    const property = node.property;
    const isPlainProperty = node.computed !== true || isPlainValue(property);
    return isPlainProperty && isReference(node.object);
};
const isPlainValue = (node) => {
    if (node.type === "Literal")
        return true;
    if (node.type === "TemplateLiteral")
        return node.expressions.length === 0;
    return isReference(node);
};
/** handleRemoveClick(connection.id): a named function called with plain values only. */
const isBoundHandler = (node) => {
    if (node.type !== "CallExpression" || node.optional === true)
        return false;
    const args = node.arguments;
    return isReference(node.callee) && args.every(isPlainValue);
};
const isPassThroughExpression = (node) => {
    const expression = node;
    return isReference(expression) || isBoundHandler(expression);
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            namedJsxHandler: "Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.",
        },
    },
    create(context) {
        return {
            JSXAttribute(node) {
                const attribute = asJsxAttribute(node);
                if (attribute.name.type !== "JSXIdentifier" || attribute.name.name === undefined) {
                    return;
                }
                if (!isHandlerPropName(attribute.name.name)) {
                    return;
                }
                if (attribute.value === null || attribute.value === undefined) {
                    return;
                }
                if (attribute.value.type !== "JSXExpressionContainer") {
                    return;
                }
                const { expression } = attribute.value;
                if (expression === undefined || expression.type === "JSXEmptyExpression") {
                    return;
                }
                if (isPassThroughExpression(expression)) {
                    return;
                }
                context.report({
                    node: expression,
                    messageId: "namedJsxHandler",
                });
            },
        };
    },
};
export const namedJsxHandlersRule = defineRule({
    id: "named-jsx-handlers",
    title: "Name every non-pass-through React handler",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=namedJsxHandlers.rule.js.map