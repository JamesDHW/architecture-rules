import type { Rule } from "eslint";

import { isRecord } from "../core/guards.js";
import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { withPlaceholders } from "./messagePlaceholders.js";
import { isNamingPolicy, namingError, namingSchema, type NamingPolicy } from "./namingPolicy.js";

/** The runner passes each file's layer naming policy; the rule cannot be configured directly. */
export type FileNamingOptions = { readonly architecture?: NamingPolicy };

const DESCRIPTION = `
Name files after one primary concept.

Layers select files by path, never by spelling. Each layer's naming policy then
validates every file it selected, so a filename failure cannot move a file out
of scope. A filename reads <stem><suffixes>.<extension>: the stem uses one of
the configured cases (camelCase, PascalCase, kebab-case or snake_case) and any
required prefix. Optional suffixes may stack in any order; requiredSuffix makes
one of them mandatory. Exact framework names such as page.tsx exempt naming only.

This package imposes no filename convention of its own: without a naming policy,
every filename is allowed.

A predictable filename tells the reader which concept the module holds.
`.trim();

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [{ type: "object", properties: { architecture: namingSchema }, additionalProperties: false }],
    messages: { architectureName: "{{message}} See rule file-naming." },
  },
  create(context) {
    return {
      Program(node) {
        const options: unknown = context.options[0];
        const policy = isRecord(options) ? options.architecture : undefined;
        const message = isNamingPolicy(policy) ? namingError(context.filename, policy) : undefined;
        if (message === undefined) return;
        context.report(withPlaceholders({ node, messageId: "architectureName" }, { message }));
      },
    };
  },
};

export const fileNamingRule = defineRule({
  id: "file-naming",
  options: defineRuleOptions<[FileNamingOptions?]>(implementation.meta?.schema ?? []),
  title: "Name files after one primary concept",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
