import type { RuleCases } from "../../core/ruleCases.js";

export const noRawExceptionsCases: readonly RuleCases[] = [
  {
    valid: ["const result = await tryCatch(() => loadProject());"],
    invalid: [
      "throw new ProjectError();",
      "try { loadProject(); } catch (caught) { reportFailure(caught); }",
    ].map((code) => ({ code, errors: [{ messageId: "raw" }] })),
  },
];
