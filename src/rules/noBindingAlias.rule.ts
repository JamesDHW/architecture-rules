import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not declare or assign a variable solely to give an existing variable another
name, and do not rename imports with as. Use the original name, or create a
genuinely new value through a named transformation. Renaming while destructuring
an object property remains allowed.

Multiple names for the same binding force readers to track identity without
adding information.
`.trim();

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

        if (node.init.type !== "Identifier") {
          return;
        }

        context.report({
          node,
          messageId: "bindingAlias",
        });
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
