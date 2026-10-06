import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { childNode, isNodeOfType, stringProperty } from "./syntaxNode.js";

const DESCRIPTION = `
Warn when an import ascends three or more parent directories. Use the owning
module's alias when crossing to a top-level area rather than navigating the
repository with ../../../ paths.

A deeply ascending path obscures the dependency's ownership and is fragile
under file moves.
`.trim();

const isDeepRelative = (source: string | undefined): boolean => {
  return (source?.match(/\.\.\//g)?.length ?? 0) >= 3;
};

const getImportSource = (node: Rule.Node): string | undefined => {
  const source = childNode(node, "source");
  return isNodeOfType(source, "Literal") ? stringProperty(source, "value") : undefined;
};

const reportIfDeep = (context: Rule.RuleContext, node: Rule.Node): void => {
  if (!isDeepRelative(getImportSource(node))) return;
  context.report({
    node,
    messageId: "deepRelativeImport",
  });
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: DESCRIPTION,
    },
    messages: {
      deepRelativeImport:
        "Do not import through three or more parent directories. Use a module alias. See rule no-deep-relative-imports.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        reportIfDeep(context, node);
      },
      ExportNamedDeclaration(node) {
        reportIfDeep(context, node);
      },
      ExportAllDeclaration(node) {
        reportIfDeep(context, node);
      },
    };
  },
};

export const noDeepRelativeImportsRule = defineRule({
  id: "no-deep-relative-imports",
  title: "Warn on deeply ascending relative imports",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "warn",
    implementation,
  },
});
