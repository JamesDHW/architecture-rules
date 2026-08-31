import { defineRule } from "../core/defineRule.js";
export const uncheckedIndexedAccessRule = defineRule({
    id: "checked-indexed-access",
    title: "Check every indexed collection access",
    description: `
Treat array and record lookups as potentially undefined unless the type
system can prove the requested entry exists.

Runtime collections do not guarantee that an index or arbitrary key is
present. I want that uncertainty represented directly in the type.
  `.trim(),
    enforcement: {
        type: "typescript",
        compilerOptions: {
            noUncheckedIndexedAccess: true,
        },
    },
});
//# sourceMappingURL=uncheckedIndexedAccess.rule.js.map