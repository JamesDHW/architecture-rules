import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
When the remaining path of a function or block is only "if condition return
true; return false" or the reverse, return the condition instead.

Early returns that exit with true or false remain allowed when later paths
return something other than the opposite literal. Those are exception-first
decisions, not a boolean wrapped in a detour.
`.trim();

type LooseNode = {
  readonly type: string;
  readonly alternate?: LooseNode | null | undefined;
  readonly argument?: {
    readonly type: string;
    readonly value?: unknown;
  } | null;
  readonly body?: readonly LooseNode[] | undefined;
  readonly consequent?: LooseNode | undefined;
};

const asLoose = (node: object): LooseNode => node as unknown as LooseNode;

const asLooseList = (nodes: readonly object[]): readonly LooseNode[] => {
  return nodes as unknown as readonly LooseNode[];
};

const getSoleStatement = (statement: LooseNode): LooseNode | undefined => {
  if (statement.type !== "BlockStatement") {
    return statement;
  }

  if (statement.body === undefined || statement.body.length !== 1) {
    return undefined;
  }

  return statement.body[0];
};

const getReturnedBoolean = (statement: LooseNode): boolean | undefined => {
  if (statement.type !== "ReturnStatement") {
    return undefined;
  }

  const argument = statement.argument;
  if (argument === undefined || argument === null || argument.type !== "Literal") {
    return undefined;
  }

  if (argument.value !== true && argument.value !== false) {
    return undefined;
  }

  return argument.value;
};

const getSoleReturnedBoolean = (statement: LooseNode): boolean | undefined => {
  const sole = getSoleStatement(statement);
  if (sole === undefined) {
    return undefined;
  }

  return getReturnedBoolean(sole);
};

const reportIfOppositeBooleanReturns = (
  context: Rule.RuleContext,
  node: Rule.Node,
  thenValue: boolean | undefined,
  elseValue: boolean | undefined,
) => {
  if (thenValue === undefined || elseValue === undefined) {
    return;
  }

  if (thenValue === elseValue) {
    return;
  }

  context.report({
    node,
    messageId: "booleanTail",
  });
};

const checkStatements = (
  context: Rule.RuleContext,
  statements: readonly LooseNode[],
) => {
  for (const [index, statement] of statements.entries()) {
    if (statement.type !== "IfStatement" || statement.consequent === undefined) {
      continue;
    }

    const next = statements[index + 1];
    if (next === undefined) {
      continue;
    }

    if (statement.alternate !== null && statement.alternate !== undefined) {
      continue;
    }

    reportIfOppositeBooleanReturns(
      context,
      statement as Rule.Node,
      getSoleReturnedBoolean(statement.consequent),
      getReturnedBoolean(next),
    );
  }
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      booleanTail:
        "Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.",
    },
  },
  create(context) {
    return {
      IfStatement(node) {
        if (node.alternate === null || node.alternate === undefined) {
          return;
        }

        if (node.alternate.type === "IfStatement") {
          return;
        }

        reportIfOppositeBooleanReturns(
          context,
          node,
          getSoleReturnedBoolean(asLoose(node.consequent)),
          getSoleReturnedBoolean(asLoose(node.alternate)),
        );
      },
      SwitchCase(node) {
        checkStatements(context, asLooseList(node.consequent));
      },
      Program(node) {
        checkStatements(context, asLooseList(node.body));
      },
      BlockStatement(node) {
        checkStatements(context, asLooseList(node.body));
      },
    };
  },
};

export const preferSingleBooleanReturnRule = defineRule({
  id: "prefer-single-boolean-return",
  title: "Return a boolean expression instead of a true/false tail",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
