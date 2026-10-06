import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not declare variables with let. Declare every binding with const and compute
a new value instead of reassigning an old one.

Good: const visibleProjects = projects.filter(isVisible);
Bad:  let count = 0; count += 1;

State that must outlive a function call lives in a *.state.ts module (see rule
no-captured-mutation). One-time platform signals such as AbortSignal and Promise
replace flags and counters that would otherwise need reassignment.
`.trim();

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: {
      noLet: "Declare this with const and compute a new value instead of reassigning. Long-lived state belongs in a *.state.ts module. See rule no-let.",
    },
  },
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind !== "let") return;
        context.report({ node, messageId: "noLet" });
      },
    };
  },
};

export const noLetRule = defineRule({
  id: "no-let",
  title: "Declare every binding with const",
  description: DESCRIPTION,
  instead: "Declare with const and compute a new value; keep long-lived state in a *.state.ts module.",
  evasions: [
    {
      name: "An array used as a variable",
      code: "const createRetrier = () => {\n  const attempts: number[] = [];\n  return () => {\n    attempts.push(1);\n    return attempts.length;\n  };\n};",
      why: "The count is still mutable state shared between calls, only hidden in an array. Pass the count as a parameter, or keep the state in a *.state.ts module.",
      caughtBy: "no-captured-mutation",
    },
    {
      name: "An object used as a variable",
      code: "const createCounter = () => {\n  const counter = { value: 0 };\n  return () => {\n    counter.value += 1;\n    return counter.value;\n  };\n};",
      why: "Moving the reassignment onto a property keeps the same mutable state. Compute a new value, or keep long-lived state in a *.state.ts module.",
      caughtBy: "no-captured-mutation",
    },
  ],
  enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
