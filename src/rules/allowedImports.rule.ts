import type { Rule } from "eslint";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { defineRule } from "../core/defineRule.js";
import { withPlaceholders } from "./messagePlaceholders.js";

const DESCRIPTION = `
Import only what the importing file's layer lists in its dependencies.
Internal edges are checked against the resolved target's layer, packages and
node: built-ins against the external specifier patterns, and assets against
explicit paths. Omission grants no permission. Re-exports and
type-only imports are dependencies too. Nonliteral module loading requires a
reasoned exception. Dynamic runtime loaders/eval and transitive function purity
are not proved by this check. The architecture runner supplies resolved edge
diagnostics; direct plugin use alone does not enforce this policy.
`.trim();

/** A denied import edge the architecture runner resolved before lint. */
type ImportIssue = { readonly line: number; readonly column: number; readonly message: string };

const isImportIssue = (value: unknown): value is ImportIssue => {
  return isRecord(value) && typeof value.line === "number" && typeof value.column === "number" && isString(value.message);
};

const getImportIssues = (options: unknown): readonly ImportIssue[] => {
  const issues = isRecord(options) ? options.issues : undefined;
  return isUnknownArray(issues) ? issues.filter(isImportIssue) : [];
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "problem", docs: { description: DESCRIPTION },
    schema: [{ type: "object", properties: { issues: { type: "array", items: { type: "object", properties: { line: { type: "integer", minimum: 1 }, column: { type: "integer", minimum: 0 }, message: { type: "string" } }, required: ["line", "column", "message"], additionalProperties: false } } }, required: ["issues"], additionalProperties: false }],
    messages: { denied: "{{message}} See rule allowed-imports." },
  },
  create(context) {
    return { Program() {
      for (const issue of getImportIssues(context.options[0])) {
        context.report(withPlaceholders({ loc: { line: issue.line, column: issue.column }, messageId: "denied" }, { message: issue.message }));
      }
    } };
  },
};
export const allowedImportsRule = defineRule({ id: "allowed-imports", title: "Respect architectural import permissions", description: DESCRIPTION, enforcement: { type: "custom-oxlint", configuration: "error", implementation } });
