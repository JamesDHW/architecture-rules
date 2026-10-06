import type { AST, Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { childNode, childNodes, locationOf, stringProperty, type SyntaxNode } from "./syntaxNode.js";

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

const isHandlerPropName = (name: string | undefined): boolean => {
  return name !== undefined && name.startsWith("on") && name.length > 2 && name[2] === name[2]?.toUpperCase();
};

/** A name or a property path such as model.handleSave or rows[index]; never a call. */
const isReference = (node: SyntaxNode | undefined): boolean => {
  if (node?.type === "Identifier") return true;
  if (node?.type !== "MemberExpression") return false;
  const isPlainProperty = node.computed !== true || isPlainValue(childNode(node, "property"));
  return isPlainProperty && isReference(childNode(node, "object"));
};

/** A literal, a template literal without expressions, or a reference. */
const isPlainValue = (node: SyntaxNode | undefined): boolean => {
  if (node?.type === "TemplateLiteral") return childNodes(node, "expressions").length === 0;
  return node?.type === "Literal" || isReference(node);
};

/** handleRemoveClick(connection.id): a named function called with plain values only. */
const isBoundHandler = (node: SyntaxNode): boolean => {
  if (node.type !== "CallExpression") return false;
  return node.optional !== true && isReference(childNode(node, "callee")) && childNodes(node, "arguments").every(isPlainValue);
};

const isPassThroughExpression = (node: SyntaxNode): boolean => isReference(node) || isBoundHandler(node);

const isInlineHandler = (expression: SyntaxNode | undefined): expression is SyntaxNode => {
  return expression !== undefined && !isPassThroughExpression(expression);
};

/** The expression in onX={expression}; undefined for other props, string values and empty containers. */
const handlerExpression = (attribute: Rule.Node): SyntaxNode | undefined => {
  const name = childNode(attribute, "name");
  const propName = name?.type === "JSXIdentifier" ? stringProperty(name, "name") : undefined;
  if (!isHandlerPropName(propName)) return undefined;
  const value = childNode(attribute, "value");
  const expression = value?.type === "JSXExpressionContainer" ? childNode(value, "expression") : undefined;
  return expression?.type === "JSXEmptyExpression" ? undefined : expression;
};

/** Where an inline handler such as onClick={() => save()} appears, when this attribute has one. */
const inlineHandlerLocation = (attribute: Rule.Node): AST.SourceLocation | undefined => {
  const expression = handlerExpression(attribute);
  return isInlineHandler(expression) ? locationOf(expression) : undefined;
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      namedJsxHandler:
        "Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.",
    },
  },
  create(context) {
    return {
      JSXAttribute(node: Rule.Node) {
        const loc = inlineHandlerLocation(node);
        if (loc !== undefined) {
          context.report({ loc, messageId: "namedJsxHandler" });
        }
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
