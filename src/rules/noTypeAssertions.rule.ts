import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not use unchecked type assertions in application code. Type-preserving
constructs such as as const and satisfies remain allowed.

Escape hatches move type errors away from their cause and make readers trust
claims the compiler cannot verify.
`.trim();

type TypeAnnotation = {
  readonly type?: string;
  readonly typeName?: {
    readonly type?: string;
    readonly name?: string;
  };
};

const getTypeAnnotation = (node: Rule.Node): TypeAnnotation | undefined => {
  if (!("typeAnnotation" in node)) {
    return undefined;
  }

  const { typeAnnotation } = node as Rule.Node & {
    readonly typeAnnotation?: TypeAnnotation;
  };

  return typeAnnotation;
};

const isConstKeyword = (typeAnnotation: TypeAnnotation): boolean => {
  if (typeAnnotation.type === "TSConstKeyword") {
    return true;
  }

  if (typeAnnotation.type !== "TSTypeReference") {
    return false;
  }

  return typeAnnotation.typeName?.type === "Identifier" && typeAnnotation.typeName.name === "const";
};

const reportUnlessConstAssertion = (
  context: Rule.RuleContext,
  node: Rule.Node,
) => {
  const typeAnnotation = getTypeAnnotation(node);
  if (typeAnnotation !== undefined && isConstKeyword(typeAnnotation)) {
    return;
  }

  context.report({
    node,
    messageId: "noTypeAssertions",
  });
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      noTypeAssertions:
        "Do not use type assertions. Prefer validation, narrowing, or as const. See rule no-type-assertions.",
    },
  },
  create(context) {
    return {
      TSAsExpression(node: Rule.Node) {
        reportUnlessConstAssertion(context, node);
      },
      TSTypeAssertion(node: Rule.Node) {
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
