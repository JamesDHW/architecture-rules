import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Mark every data-model property and collection readonly, and compose nested
models that are themselves readonly. Mutable types may exist only inside
isolated adapters where an external API requires mutation.

Readonly types prevent mutation through this contract and tell readers that
consumers must treat the value as immutable.
`.trim();

type TypeLiteralMember = {
  readonly type: string;
  readonly readonly?: boolean;
};

const getTypeLiteralMembers = (node: Rule.Node): readonly TypeLiteralMember[] => {
  if (!("members" in node) || !Array.isArray(node.members)) {
    return [];
  }

  return node.members as readonly TypeLiteralMember[];
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      readonlyProperty:
        "Type-literal properties and index signatures must be readonly. See rule readonly-type-properties.",
    },
  },
  create(context) {
    return {
      TSTypeLiteral(node: Rule.Node) {
        for (const member of getTypeLiteralMembers(node)) {
          if (member.type !== "TSPropertySignature" && member.type !== "TSIndexSignature") {
            continue;
          }

          if (member.readonly === true) {
            continue;
          }

          context.report({
            node: member as Rule.Node,
            messageId: "readonlyProperty",
          });
        }
      },
    };
  },
};

export const readonlyTypePropertiesRule = defineRule({
  id: "readonly-type-properties",
  title: "Declare data as recursively readonly",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
