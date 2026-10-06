import type { Rule, Scope } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not declare a const solely to give an existing binding another name, and do
not rename imports with as. Use the original name, or create a genuinely new
value through a named transformation. Renaming while destructuring an object
property remains allowed.

Good: if (shouldEnable) { startSynchronization(); }
Bad: const isEnabled = shouldEnable;
Good: const normalizedProjectName = projectName.trim();

To publish one value under a second public name, rename it in the export list:
export { listedPackageSchema as registeredPackageSchema }. That states the intent
at the module boundary instead of creating a local synonym.

Multiple synonymous names for the same binding force readers to track identity
without adding information. This detects direct aliases, not English synonymy
between names of genuinely different computations.

Only const declarations are aliases: reassignment is covered by no-let,
no-var and no-param-reassign. The global undefined value is not an alias
source; a local binding named undefined is.
`.trim();

type Identifier = Parameters<Rule.RuleContext["sourceCode"]["getScope"]>[0] & { readonly name: string };

const declaresName = (scope: Scope.Scope | null, name: string): boolean => {
  if (scope === null) return false;
  const definitionCount = scope.set.get(name)?.defs.length ?? 0;
  return definitionCount > 0 || declaresName(scope.upper, name);
};

/** Oxlint does not model undefined as a declared global, so resolve it through the scope chain. */
const isGlobalUndefined = (node: Identifier, context: Rule.RuleContext): boolean => {
  return node.name === "undefined" && !declaresName(context.sourceCode.getScope(node), node.name);
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    schema: [],
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
        const declaresConstName = node.parent.type === "VariableDeclaration" && node.parent.kind === "const" && node.id.type === "Identifier";
        const isAlias = declaresConstName && node.init?.type === "Identifier" && !isGlobalUndefined(node.init, context);
        if (!isAlias) return;
        context.report({ node, messageId: "bindingAlias" });
      },
      ImportSpecifier(node) {
        const isRenamed = node.imported.type === "Identifier" && node.imported.name !== node.local.name;
        if (!isRenamed) return;
        context.report({ node, messageId: "importAlias" });
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
