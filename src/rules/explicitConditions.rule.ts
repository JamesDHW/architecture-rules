import { defineRule } from "../core/defineRule.js";

export const explicitConditionsRule = defineRule({
  id: "explicit-conditions",

  title: "Use explicit conditions for non-boolean values",

  description: `
Only boolean-typed expressions may be tested directly.

Compare strings, numbers, objects, and nullish values explicitly according
to the intended condition.

Prefer:

  if (projects.length > 0) {}
  if (project !== undefined) {}

Avoid:

  if (projects.length) {}
  if (project) {}

I prefer the exact condition to be visible at the point of use rather than
requiring the reader to reconstruct JavaScript truthiness semantics.
  `.trim(),

  enforcement: {
    type: "oxlint",

    rule: "typescript/strict-boolean-expressions",

    configuration: [
      "error",
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
      },
    ],
  },
});
