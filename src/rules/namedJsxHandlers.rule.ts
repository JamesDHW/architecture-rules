import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
JSX may pass through an existing callback directly. Any handler that creates
behavior—by adapting arguments, branching, sequencing work, or invoking a
domain operation—must be a descriptively named value outside the JSX.

Named handlers keep JSX focused on describing the interface and give behavior
a searchable name that communicates the user action it implements.
`.trim();

const isHandlerPropName = (name: string): boolean => {
  return name.startsWith("on") && name.length > 2 && name[2] === name[2]?.toUpperCase();
};

type JsxAttributeNode = {
  readonly name: {
    readonly type: string;
    readonly name?: string;
  };
  readonly value?: {
    readonly type: string;
    readonly expression?: {
      readonly type: string;
    };
  } | null;
};

const asJsxAttribute = (node: Rule.Node): JsxAttributeNode => {
  return node as unknown as JsxAttributeNode;
};

const isPassThroughExpression = (node: { readonly type: string }): boolean => {
  return node.type === "Identifier" || node.type === "MemberExpression";
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
          node: expression as Rule.Node,
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
