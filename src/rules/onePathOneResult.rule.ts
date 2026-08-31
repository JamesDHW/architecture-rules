import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not make different branches produce the same result. Extract logic that is
duplicated in each branch to after the branching, or combine the predicates
when the outcomes are identical.

Duplicated branch results hide that the condition does not change what
happens.
`.trim();

type LooseNode = {
  readonly type: string;
  readonly alternate?: LooseNode | null | undefined;
  readonly consequent?: LooseNode | undefined;
};

const asLoose = (node: object): LooseNode => node as unknown as LooseNode;

const asLooseList = (nodes: readonly object[]): readonly LooseNode[] => {
  return nodes as unknown as readonly LooseNode[];
};

const normalizeText = (
  sourceCode: Rule.RuleContext["sourceCode"],
  node: LooseNode,
): string => {
  return sourceCode.getText(node as Rule.Node).replaceAll(/\s+/g, " ").trim();
};

const collectBranchConsequents = (node: LooseNode): LooseNode[] => {
  if (node.type !== "IfStatement" || node.consequent === undefined) {
    return [];
  }

  const consequents: LooseNode[] = [node.consequent];
  let alternate: LooseNode | null | undefined = node.alternate;

  while (alternate !== null && alternate !== undefined) {
    if (alternate.type === "IfStatement") {
      if (alternate.consequent !== undefined) {
        consequents.push(alternate.consequent);
      }
      alternate = alternate.alternate;
      continue;
    }

    consequents.push(alternate);
    break;
  }

  return consequents;
};

const reportDuplicateConsequents = (
  context: Rule.RuleContext,
  nodes: readonly LooseNode[],
) => {
  const seen = new Map<string, LooseNode>();

  for (const node of nodes) {
    const text = normalizeText(context.sourceCode, node);
    const first = seen.get(text);
    if (first === undefined) {
      seen.set(text, node);
      continue;
    }

    context.report({
      node: node as Rule.Node,
      messageId: "sameResult",
    });
  }
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      sameResult:
        "These branches produce the same result. Combine the predicates or extract the shared outcome. See rule one-path-one-result.",
    },
  },
  create(context) {
    const checkSiblingIfs = (statements: readonly LooseNode[]) => {
      const consequents = statements.flatMap((statement) => {
        if (statement.type !== "IfStatement") {
          return [];
        }

        if (statement.alternate !== null && statement.alternate !== undefined) {
          return [];
        }

        if (statement.consequent === undefined) {
          return [];
        }

        return [statement.consequent];
      });

      reportDuplicateConsequents(context, consequents);
    };

    return {
      IfStatement(node) {
        if (node.parent.type === "IfStatement" && node.parent.alternate === node) {
          return;
        }

        if (node.alternate === null) {
          return;
        }

        reportDuplicateConsequents(context, collectBranchConsequents(asLoose(node)));
      },
      Program(node) {
        checkSiblingIfs(asLooseList(node.body));
      },
      BlockStatement(node) {
        checkSiblingIfs(asLooseList(node.body));
      },
      SwitchCase(node) {
        checkSiblingIfs(asLooseList(node.consequent));
      },
    };
  },
};

export const onePathOneResultRule = defineRule({
  id: "one-path-one-result",
  title: "One path should produce one result",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "warn",
    implementation,
  },
});
