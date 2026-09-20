import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Import only capabilities allowed for the importing file's architectural type.
Internal edges are checked against resolved target types, external packages
against explicit specifier patterns, built-ins against normalized names, and
assets against explicit paths. Omission grants no permission. Re-exports and
type-only imports are dependencies too. Nonliteral module loading requires a
reasoned exception. Dynamic runtime loaders/eval and transitive function purity
are not proved by this check. The architecture runner supplies resolved edge
diagnostics; direct plugin use alone does not enforce this policy.
`.trim();
const implementation = {
    meta: {
        type: "problem", docs: { description: DESCRIPTION },
        schema: [{ type: "object", properties: { issues: { type: "array", items: { type: "object", properties: { line: { type: "integer", minimum: 1 }, column: { type: "integer", minimum: 0 }, message: { type: "string" } }, required: ["line", "column", "message"], additionalProperties: false } } }, required: ["issues"], additionalProperties: false }],
        messages: { denied: "{{message}} See rule allowed-imports." },
    },
    create(context) {
        return { Program() {
                const options = context.options[0];
                for (const issue of options?.issues ?? [])
                    context.report({ loc: { line: issue.line, column: issue.column }, messageId: "denied", data: { message: issue.message } });
            } };
    },
};
export const allowedImportsRule = defineRule({ id: "allowed-imports", title: "Respect architectural import permissions", description: DESCRIPTION, enforcement: { type: "custom-oxlint", configuration: "error", implementation } });
//# sourceMappingURL=allowedImports.rule.js.map