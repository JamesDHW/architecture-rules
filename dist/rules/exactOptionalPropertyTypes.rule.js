import { defineRule } from "../core/defineRule.js";
export const exactOptionalPropertyTypesRule = defineRule({
    id: "exact-optional-property-types",
    title: "Distinguish omitted properties from explicit undefined",
    description: `
Enable exactOptionalPropertyTypes so an optional property cannot be assigned
undefined unless undefined is part of its written type.

I use omitted, undefined, and null as different instructions. Optional
properties should mean "not supplied", not "possibly undefined".
  `.trim(),
    enforcement: {
        type: "typescript",
        compilerOptions: {
            exactOptionalPropertyTypes: true,
        },
    },
});
//# sourceMappingURL=exactOptionalPropertyTypes.rule.js.map