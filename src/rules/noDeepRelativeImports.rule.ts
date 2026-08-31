import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Warn when an import ascends three or more parent directories. Use the owning
module's alias when crossing to a top-level area rather than navigating the
repository with ../../../ paths.

A deeply ascending path obscures the dependency's ownership and is fragile
under file moves.
`.trim();

const isDeepRelative = (source: string): boolean => {
  const matches = source.match(/\.\.\//g);
  return matches !== null && matches.length >= 3;
};

const getImportSource = (node: Rule.Node): string | undefined => {
  if (!("source" in node)) {
    return undefined;
  }

  const { source } = node;
  if (source === null || source === undefined || typeof source !== "object") {
    return undefined;
  }

  if (!("type" in source) || source.type !== "Literal") {
    return undefined;
  }

  if (!("value" in source) || typeof source.value !== "string") {
    return undefined;
  }

  return source.value;
};

const reportIfDeep = (context: Rule.RuleContext, node: Rule.Node) => {
  const source = getImportSource(node);
  if (source === undefined) {
    return;
  }

  if (!isDeepRelative(source)) {
    return;
  }

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
