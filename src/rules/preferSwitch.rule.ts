import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Predicates that categorise the same property of a value should be written as
a switch rather than a sequence of if or else if. A switch focuses each case
on the compared value instead of repeating the whole predicate.

Polymorphic dispatch is a further step when the variants own the behaviour;
this rule only asks for switch over repeated equality tests.
`.trim();

type LooseNode = {
  readonly type: string;
  readonly operator?: string | undefined;
  readonly left?: LooseNode | undefined;
  readonly right?: LooseNode | undefined;
  readonly test?: LooseNode | undefined;
  readonly alternate?: LooseNode | null | undefined;
};

const asLoose = (node: object): LooseNode => node as unknown as LooseNode;

const asLooseList = (nodes: readonly object[]): readonly LooseNode[] => {
  return nodes as unknown as readonly LooseNode[];
};

const isDiscriminant = (node: LooseNode): boolean => {
  return node.type === "Identifier" || node.type === "MemberExpression";
};

const isCaseValue = (node: LooseNode): boolean => {
  return node.type === "Literal" || node.type === "Identifier";
};

const getEqualityDiscriminantKey = (
  test: LooseNode,
  sourceCode: Rule.RuleContext["sourceCode"],
): string | undefined => {
  if (test.type !== "BinaryExpression") {
    return undefined;
  }

  if (test.operator !== "===" && test.operator !== "==") {
    return undefined;
  }

  const { left, right } = test;
  if (left === undefined || right === undefined) {
    return undefined;
  }

  if (left.type === "MemberExpression" && isCaseValue(right)) {
    return sourceCode.getText(left as Rule.Node);
  }

  if (right.type === "MemberExpression" && isCaseValue(left)) {
    return sourceCode.getText(right as Rule.Node);
  }

  if (isDiscriminant(left) && isCaseValue(right)) {
    return sourceCode.getText(left as Rule.Node);
  }

  if (isDiscriminant(right) && isCaseValue(left)) {
    return sourceCode.getText(right as Rule.Node);
  }

  return undefined;
};

const collectChainIfs = (node: LooseNode): LooseNode[] => {
  const chain: LooseNode[] = [node];
  let alternate = node.alternate;

  while (alternate !== null && alternate !== undefined && alternate.type === "IfStatement") {
    chain.push(alternate);
    alternate = alternate.alternate;
  }

  return chain;
};

const discriminantKeyForIf = (
  node: LooseNode,
  sourceCode: Rule.RuleContext["sourceCode"],
): string | undefined => {
  if (node.type !== "IfStatement" || node.test === undefined) {
    return undefined;
  }

  return getEqualityDiscriminantKey(node.test, sourceCode);
};

const allShareDiscriminant = (
  nodes: readonly LooseNode[],
  sourceCode: Rule.RuleContext["sourceCode"],
): boolean => {
  const [head] = nodes;
  if (head === undefined || nodes.length < 2) {
    return false;
  }

  const first = discriminantKeyForIf(head, sourceCode);
  if (first === undefined) {
    return false;
  }

  return nodes.every((node) => discriminantKeyForIf(node, sourceCode) === first);
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      preferSwitch:
        "Replace repeated equality tests on the same value with a switch. See rule prefer-switch.",
    },
  },
  create(context) {
    const reported = new Set<LooseNode>();

    const reportChain = (nodes: readonly LooseNode[]) => {
      if (!allShareDiscriminant(nodes, context.sourceCode)) {
        return;
      }

      const [head] = nodes;
      if (head === undefined || reported.has(head)) {
        return;
      }

      reported.add(head);
      context.report({
        node: head as Rule.Node,
        messageId: "preferSwitch",
      });
    };

    const checkConsecutiveIfs = (statements: readonly LooseNode[]) => {
      let index = 0;
      while (index < statements.length) {
        const statement = statements[index];
        if (statement === undefined || statement.type !== "IfStatement") {
          index += 1;
          continue;
        }

        if (statement.alternate !== null && statement.alternate !== undefined) {
          index += 1;
          continue;
        }

        const run: LooseNode[] = [statement];
        let cursor = index + 1;
        const expectedKey = discriminantKeyForIf(statement, context.sourceCode);

        while (cursor < statements.length && expectedKey !== undefined) {
          const next = statements[cursor];
          if (
            next === undefined ||
            next.type !== "IfStatement" ||
            (next.alternate !== null && next.alternate !== undefined)
          ) {
            break;
          }

          if (discriminantKeyForIf(next, context.sourceCode) !== expectedKey) {
            break;
          }

          run.push(next);
          cursor += 1;
        }

        reportChain(run);
        index = cursor;
      }
    };

    return {
      IfStatement(node) {
        if (node.parent.type === "IfStatement" && node.parent.alternate === node) {
          return;
        }

        reportChain(collectChainIfs(asLoose(node)));
      },
      Program(node) {
        checkConsecutiveIfs(asLooseList(node.body));
      },
      BlockStatement(node) {
        checkConsecutiveIfs(asLooseList(node.body));
      },
      SwitchCase(node) {
        checkConsecutiveIfs(asLooseList(node.consequent));
      },
    };
  },
};

export const preferSwitchRule = defineRule({
  id: "prefer-switch",
  title: "Prefer switch over repeated equality ifs",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
