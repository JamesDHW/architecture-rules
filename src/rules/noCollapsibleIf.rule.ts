import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { isPresent } from "../core/guards.js";
import { getSoleStatement } from "./branchStatement.js";

const DESCRIPTION = `
Do not hide simple && or || operations in nested if blocks unless those ifs
share a prefix that would otherwise be duplicated.

A nested if whose only body is another if should be combined with &&,
retaining short-circuit evaluation order. Give the combination a named
predicate unless it qualifies for the approved nullish/presence guard plus
property-check exception in named-predicates. Preserve required type narrowing
with a suitable type predicate; never introduce an unchecked assertion.

Good:
  if (!isNullish(project) && project.isArchived) { showArchiveNotice(project); }

Bad:
  if (!isNullish(project)) {
    if (project.isArchived) { showArchiveNotice(project); }
  }

An outer gate with multiple distinct inner operations remains allowed. Do not
use an arbitrary maximum nesting depth as a substitute for meaningful extraction.
`.trim();

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      collapsibleIf:
        "Combine these sole nested ifs in short-circuit order. Name the predicate unless the approved structural-guard exception applies; preserve type narrowing. See rule no-collapsible-if.",
    },
  },
  create(context) {
    return {
      IfStatement(node) {
        if (node.alternate !== null) return;
        const inner = getSoleStatement(node.consequent);
        const isSoleElseFreeIf = inner?.type === "IfStatement" && !isPresent(inner.alternate);
        if (!isSoleElseFreeIf) return;
        context.report({ node, messageId: "collapsibleIf" });
      },
    };
  },
};

export const noCollapsibleIfRule = defineRule({
  id: "no-collapsible-if",
  title: "Do not nest a sole if inside another if",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
