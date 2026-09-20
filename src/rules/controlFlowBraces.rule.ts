import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Require braces around conditional and loop bodies, except for single-line
terminal guards. An if may omit braces only when its body is a return, throw,
break, or continue and the entire if occupies one line. Loops always use braces.
This brace exception does not permit throw outside approved error adapters,
or break/continue without a no-loop-jumps exception. Else remains forbidden
by no-else. A brace rule fixture may exercise those statements independently,
but the complete default profile still rejects them.

Good:
  if (project === undefined) return new ProjectNotFoundError();
  if (project.isArchived) {
    sendArchiveNotification(project);
  }
  const activeProjects = projects.filter(isProjectActive);
  for (const project of activeProjects) {
    sendActiveNotification(project);
  }

Bad:
  if (project.isArchived) sendArchiveNotification(project);
  if (project === undefined)
    return new ProjectNotFoundError();
  for (const project of projects) sendActiveNotification(project);

Compact guards make terminal checks easy to scan. Braces around other bodies
make their scope explicit and reduce accidentally unconditional additions.
`.trim();

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: {
      requireBraces:
        "Use braces except for single-line terminal if guards. See rule control-flow-braces.",
    },
  },
  create(context) {
    return {
      IfStatement(node) {
        if (node.consequent.type === "BlockStatement") return;

        const isTerminal =
          node.consequent.type === "ReturnStatement" ||
          node.consequent.type === "ThrowStatement" ||
          node.consequent.type === "BreakStatement" ||
          node.consequent.type === "ContinueStatement";
        const isSingleLine =
          node.loc !== undefined && node.loc !== null &&
          node.loc.start.line === node.loc.end.line;

        if (node.alternate === null && isTerminal && isSingleLine) return;

        context.report({ node: node.consequent, messageId: "requireBraces" });
      },
      "ForStatement, ForInStatement, ForOfStatement, WhileStatement, DoWhileStatement"(
        node: Parameters<NonNullable<Rule.RuleListener["ForStatement"]>>[0],
      ) {
        if (node.body.type === "BlockStatement") return;
        context.report({ node: node.body, messageId: "requireBraces" });
      },
    };
  },
};

export const controlFlowBracesRule = defineRule({
  id: "control-flow-braces",
  title: "Use braces except for single-line terminal guards",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
