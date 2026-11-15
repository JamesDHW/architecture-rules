import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { childNode, isNodeOfType, type SyntaxNode } from "./syntaxNode.js";

const DESCRIPTION = `
Do not use unchecked type assertions in application code. Type-preserving
constructs such as as const and satisfies remain allowed.

A chained assertion such as value as unknown as Project is reported once.
When a dependency's declarations lag its runtime, add a .d.ts augmentation
instead of asserting. Otherwise use a reasoned line suppression.

Escape hatches move type errors away from their cause and make readers trust
claims the compiler cannot verify.
`.trim();

const isConstKeyword = (typeAnnotation: SyntaxNode): boolean => {
  if (typeAnnotation.type === "TSConstKeyword") {
    return true;
  }

  if (typeAnnotation.type !== "TSTypeReference") {
    return false;
  }

  const typeName = childNode(typeAnnotation, "typeName");
  return isNodeOfType(typeName, "Identifier") && typeName.name === "const";
};

const isConstAssertion = (node: Rule.Node): boolean => {
  const typeAnnotation = childNode(node, "typeAnnotation");
  return typeAnnotation !== undefined && isConstKeyword(typeAnnotation);
};

const isAssertionType = (type: string): boolean => type === "TSAsExpression" || type === "TSTypeAssertion";

/** value as unknown as Project is one escape hatch: report it once, at the outermost cast. */
const isInsideAssertion = ({ parent }: Rule.Node): boolean => {
  return parent !== null && isAssertionType(parent.type) && !isConstAssertion(parent);
};

const isReportedAssertion = (node: Rule.Node): boolean => !isConstAssertion(node) && !isInsideAssertion(node);

const reportUnlessConstAssertion = (
  context: Rule.RuleContext,
  node: Rule.Node,
) => {
  if (!isReportedAssertion(node)) {
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
  instead: "Validate or narrow the value with a type guard, a schema parse or satisfies, instead of asserting its type.",
  suppressWhen: "Attaching a brand to a value that is already validated, or bridging two third-party types that are the same at runtime.",
  evasions: [
    {
      name: "A type guard that only claims the type",
      code: "const isProject = (value: unknown): value is Project => typeof value === \"object\";",
      why: "The predicate asserts the type without checking its fields, so the cast has only moved. Check every field the type promises, or parse the value with a schema.",
    },
  ],
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
