import type { RuleCases } from "../../core/ruleCases.js";

export const groupedLogicalOperatorsCases: readonly RuleCases[] = [
  {
    valid: [
      "const canEdit = isAdministrator || (isOwner && isActive);",
      "const canEdit = isOwner && isActive && hasAccess;",
      "const canEdit = (isOwner || isAdministrator) && isActive;",
    ],
    invalid: [
      "const canEdit = isAdministrator || isOwner && isActive;",
      "const canEdit = isOwner && isActive || isAdministrator;",
    ].map((code) => ({ code, errors: [{ messageId: "grouping" }] })),
  },
];
