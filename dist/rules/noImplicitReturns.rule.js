import { defineRule } from "../core/defineRule.js";
export const noImplicitReturnsRule = defineRule({
    id: "no-implicit-returns",
    title: "Require every code path to return",
    description: `
Enable noImplicitReturns so a function with a return type cannot fall off
the end of a branch without returning.

I do not want undefined to appear from a missing return when the function
claimed it would produce a value.
  `.trim(),
    enforcement: {
        type: "typescript",
        compilerOptions: {
            noImplicitReturns: true,
        },
    },
});
//# sourceMappingURL=noImplicitReturns.rule.js.map