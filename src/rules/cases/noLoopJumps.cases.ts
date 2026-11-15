import type { RuleCases } from "../../core/ruleCases.js";

export const noLoopJumpsCases: readonly RuleCases[] = [
  {
    valid: ["const findProject = () => projects.find(matchesProject);"],
    invalid: [
      {
        code: "for (const project of projects) { if (isArchived) continue; }",
        errors: [{ messageId: "jump" }],
      },
      {
        code: "for (const project of projects) { if (isArchived) break; }",
        errors: [{ messageId: "jump" }],
      },
      {
        code: "search: for (const project of projects) { break search; }",
        errors: [{ messageId: "jump" }, { messageId: "jump" }],
      },
    ],
  },
];
