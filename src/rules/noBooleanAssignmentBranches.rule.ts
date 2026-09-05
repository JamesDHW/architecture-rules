import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not assign true or false inside a branch to keep a boolean for later.
Return the value now, or assign the boolean expression directly.

A result flag makes the flow rely on state that a later change can corrupt
and hides that the function is computing one boolean.
`.trim();

type LooseNode = {
  readonly type: string;
  readonly body?: readonly LooseNode[] | undefined;
  readonly expression?: LooseExpression | undefined;
};

type LooseExpression = {
  readonly type: string;
  readonly operator?: string;
  readonly left?: {
    readonly type: string;
    readonly name?: string;
  };
  readonly right?: {
    readonly type: string;
    readonly value?: unknown;
  };
};

const asLoose = (node: object): LooseNode => node as unknown as LooseNode;

const getSoleStatement = (statement: LooseNode): LooseNode | undefined => {
  if (statement.type !== "BlockStatement") {
    return statement;
  }

  if (statement.body === undefined || statement.body.length !== 1) {
    return undefined;
  }

  return statement.body[0];
};

const isBooleanLiteralAssignment = (statement: LooseNode): boolean => {
  const sole = getSoleStatement(statement);
  if (sole === undefined || sole.type !== "ExpressionStatement") {
    return false;
  }

  const expression = sole.expression;
  if (expression === undefined || expression.type !== "AssignmentExpression") {
    return false;
  }

  if (expression.operator !== "=") {
    return false;
  }

  if (expression.left === undefined || expression.left.type !== "Identifier") {
    return false;
  }

  if (expression.right === undefined || expression.right.type !== "Literal") {
    return false;
  }

  return expression.right.value === true || expression.right.value === false;
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      booleanAssignment:
        "Do not assign true or false in a branch. Return the value now, or assign the boolean expression. See rule no-boolean-assignment-branches.",
    },
  },
  create(context) {
    return {
      IfStatement(node) {
        if (isBooleanLiteralAssignment(asLoose(node.consequent))) {
          context.report({
            node: node.consequent,
            messageId: "booleanAssignment",
          });
        }

        if (node.alternate === null || node.alternate === undefined) {
          return;
        }

        if (node.alternate.type === "IfStatement") {
          return;
        }

        if (!isBooleanLiteralAssignment(asLoose(node.alternate))) {
          return;
        }

        context.report({
          node: node.alternate,
          messageId: "booleanAssignment",
        });
      },
    };
  },
};

export const noBooleanAssignmentBranchesRule = defineRule({
  id: "no-boolean-assignment-branches",
  title: "Do not assign boolean literals in branches",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
