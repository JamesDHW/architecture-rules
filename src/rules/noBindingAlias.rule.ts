import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not declare or assign a variable solely to give an existing variable another
name, and do not rename imports with as. Use the original name, or create a
genuinely new value through a named transformation. Renaming while destructuring
an object property remains allowed.

Good: if (shouldEnable) { startSynchronization(); }
Bad: const isEnabled = shouldEnable;
Bad: isEnabled = shouldEnable;
Good: const normalizedProjectName = projectName.trim();

Multiple synonymous names for the same binding force readers to track identity
without adding information. This detects direct aliases, not English synonymy
between names of genuinely different computations.

The global undefined value is not an alias source: initializing with undefined
or assigning undefined to clear optional state is outside this rule. A local
binding named undefined is still subject to the alias check. This exclusion
classifies aliasing only; it does not endorse mutable state or recommend resets.
Whether mutation is appropriate belongs to the separate immutability policy.
`.trim();

type Identifier = Parameters<Rule.RuleContext["sourceCode"]["isGlobalReference"]>[0];

const isGlobalUndefined = (node: Identifier, context: Rule.RuleContext): boolean => {
  return node.name === "undefined" && context.sourceCode.isGlobalReference(node);
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      bindingAlias:
        "Do not alias an existing binding. Use the original name or compute a new value. See rule no-binding-alias.",
      importAlias:
        "Do not rename imports with as. Use the original export name. See rule no-binding-alias.",
    },
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") {
          return;
        }

        if (node.init === null || node.init === undefined) {
          return;
        }

        if (node.init.type !== "Identifier" || isGlobalUndefined(node.init, context)) {
          return;
        }

        context.report({
          node,
          messageId: "bindingAlias",
        });
      },
      AssignmentExpression(node) {
        if (node.operator !== "=" || node.left.type !== "Identifier" || node.right.type !== "Identifier") return;
        if (isGlobalUndefined(node.right, context)) return;
        context.report({ node, messageId: "bindingAlias" });
      },
      ImportSpecifier(node) {
        if (node.imported.type !== "Identifier") {
          return;
        }

        if (node.imported.name === node.local.name) {
          return;
        }

        context.report({
          node,
          messageId: "importAlias",
        });
      },
    };
  },
};

export const noBindingAliasRule = defineRule({
  id: "no-binding-alias",
  title: "Do not rename values through aliases",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
