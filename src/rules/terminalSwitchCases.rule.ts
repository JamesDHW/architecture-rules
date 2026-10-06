import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Use switches for behavior dispatch over a discriminant, not switch(true) or
switch(false) predicate chains. Ordered predicates belong in guard clauses.
Each nonempty case
body must end in a return. Extract dispatch into a focused helper when shared
work must follow it. Do not break out of the switch to continue the caller.
Adjacent empty labels may share the next terminal body; a trailing empty
label has no body and is not allowed. Case braces are optional, except where
lexical declarations need their own scope.

Good:
  switch (request.status) {
    case "idle":
    case "loading":
      return showPendingRequest();
    case "success":
      return showProject(request.project);
    case "failure":
      return showFailure(request.error);
    default:
      return request satisfies never;
  }

Bad:
  switch (request.status) {
    case "success":
      publishProject(request.project);
      break;
  }
  recordRequestHandled();

This syntactic rule checks the final statement, including a final nested block.
It does not prove type exhaustiveness or infer whether every path through a
nested conditional returns. Express nested decisions in a named operation
returned by the case. Closed-domain coverage is checked separately.
`.trim();

type Statement = Parameters<NonNullable<Rule.RuleListener["IfStatement"]>>[0]["consequent"];

const endsInReturn = (statement: Statement | undefined): boolean => {
  if (statement?.type === "ReturnStatement") return true;
  if (statement?.type !== "BlockStatement") return false;
  return endsInReturn(statement.body.at(-1));
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: {
      terminal: "End this switch case with a return. Extract dispatch into a focused helper when shared work follows. See rule terminal-switch-cases.",
      predicateSwitch: "Use ordered guard clauses instead of switch(true/false). See rule terminal-switch-cases.",
    },
  },
  create(context) {
    return {
      SwitchStatement(node) {
        const isPredicateSwitch = node.discriminant.type === "Literal" && typeof node.discriminant.value === "boolean";
        if (isPredicateSwitch) {
          context.report({ node: node.discriminant, messageId: "predicateSwitch" });
        }
        const lastIndex = node.cases.length - 1;
        const unterminatedCases = node.cases.filter((branch, index) => {
          const isStackedLabel = branch.consequent.length === 0 && index < lastIndex;
          return !isStackedLabel && !endsInReturn(branch.consequent.at(-1));
        });
        for (const branch of unterminatedCases) {
          context.report({ node: branch, messageId: "terminal" });
        }
      },
    };
  },
};

export const terminalSwitchCasesRule = defineRule({
  id: "terminal-switch-cases",
  title: "Return from switch cases in a focused operation",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
