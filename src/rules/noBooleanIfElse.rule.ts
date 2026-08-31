import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not use intermediary branches to pass true and false into the same call.
Pass the boolean expression directly.

Stopping the flow instead of accumulating flag assignments prevents unwanted
behaviour during a change.
`.trim();

type LooseNode = {
  readonly type: string;
  readonly body?: readonly LooseNode[] | undefined;
  readonly expression?:
    | {
        readonly type: string;
        readonly callee?: object;
        readonly arguments?: readonly {
          readonly type: string;
          readonly value?: unknown;
        }[];
      }
    | undefined;
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

const getBooleanLiteralArg = (statement: LooseNode): boolean | undefined => {
  const sole = getSoleStatement(statement);
  if (sole === undefined || sole.type !== "ExpressionStatement") {
    return undefined;
  }

  if (sole.expression === undefined || sole.expression.type !== "CallExpression") {
    return undefined;
  }

  const args = sole.expression.arguments;
  if (args === undefined || args.length !== 1) {
    return undefined;
  }

  const [argument] = args;
  if (argument === undefined || argument.type !== "Literal") {
    return undefined;
  }

  if (argument.value !== true && argument.value !== false) {
    return undefined;
  }

  return argument.value;
};

const getCalleeText = (
  statement: LooseNode,
  sourceCode: Rule.RuleContext["sourceCode"],
): string | undefined => {
  const sole = getSoleStatement(statement);
  if (sole === undefined || sole.type !== "ExpressionStatement") {
    return undefined;
  }

  if (sole.expression === undefined || sole.expression.type !== "CallExpression") {
    return undefined;
  }

  if (sole.expression.callee === undefined) {
    return undefined;
  }

  return sourceCode.getText(sole.expression.callee as Rule.Node);
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      booleanIfElse:
        "Pass the boolean expression into the call directly instead of branching on true and false. See rule no-boolean-if-else.",
    },
  },
  create(context) {
    return {
      IfStatement(node) {
        if (node.alternate === null || node.alternate === undefined) {
          return;
        }

        const thenValue = getBooleanLiteralArg(asLoose(node.consequent));
        const elseValue = getBooleanLiteralArg(asLoose(node.alternate));
        if (thenValue === undefined || elseValue === undefined) {
          return;
        }

        if (thenValue === elseValue) {
          return;
        }

        const thenCallee = getCalleeText(asLoose(node.consequent), context.sourceCode);
        const elseCallee = getCalleeText(asLoose(node.alternate), context.sourceCode);
        if (thenCallee === undefined || elseCallee === undefined) {
          return;
        }

        if (thenCallee !== elseCallee) {
          return;
        }

        context.report({
          node,
          messageId: "booleanIfElse",
        });
      },
    };
  },
};

export const noBooleanIfElseRule = defineRule({
  id: "no-boolean-if-else",
  title: "Pass booleans directly instead of branching",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
