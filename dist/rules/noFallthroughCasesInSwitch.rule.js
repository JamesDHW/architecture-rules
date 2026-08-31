import { defineRule } from "../core/defineRule.js";
export const noFallthroughCasesInSwitchRule = defineRule({
    id: "no-fallthrough-cases-in-switch",
    title: "Do not fall through switch cases",
    description: `
Enable noFallthroughCasesInSwitch so a case must break, return, or throw
unless it is empty and intentionally grouped.

Accidental fallthrough is too easy to miss when reading variant-specific
logic. Grouped empty cases remain valid.
  `.trim(),
    enforcement: {
        type: "typescript",
        compilerOptions: {
            noFallthroughCasesInSwitch: true,
        },
    },
});
//# sourceMappingURL=noFallthroughCasesInSwitch.rule.js.map