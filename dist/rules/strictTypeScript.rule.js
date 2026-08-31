import { defineRule } from "../core/defineRule.js";
export const strictTypeScriptRule = defineRule({
    id: "strict-typescript",
    title: "Use TypeScript strict mode",
    description: `
Enable TypeScript's strict family of type-system checks.

I want compiler uncertainty to be surfaced rather than silently widened
into permissive types. New strict checks introduced by TypeScript should
become part of the default rather than requiring individual opt-in.
  `.trim(),
    enforcement: {
        type: "typescript",
        compilerOptions: {
            strict: true,
        },
    },
});
//# sourceMappingURL=strictTypeScript.rule.js.map