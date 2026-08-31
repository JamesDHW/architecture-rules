import { defineRule } from "../core/defineRule.js";
export const noImplicitOverrideRule = defineRule({
    id: "no-implicit-override",
    title: "Mark override methods explicitly",
    description: `
Enable noImplicitOverride so a method that overrides a base member must be
marked override.

Renaming or removing a base member should fail at the override site rather
than silently leaving a leftover method behind.
  `.trim(),
    enforcement: {
        type: "typescript",
        compilerOptions: {
            noImplicitOverride: true,
        },
    },
});
//# sourceMappingURL=noImplicitOverride.rule.js.map