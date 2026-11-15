import type { RuleCases } from "../../core/ruleCases.js";

export const noEnumsCases: readonly RuleCases[] = [
  {
    valid: [
      {
        name: "literal union",
        code: 'type ProjectStatus = "draft" | "active" | "archived";\n',
      },
    ],
    invalid: [
      {
        name: "enum declaration",
        code: "enum ProjectStatus { Draft, Active }\n",
        errors: [{ messageId: "noEnums" }],
      },
    ],
  },
];
