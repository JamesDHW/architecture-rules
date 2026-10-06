import type { RuleCases } from "../../core/ruleCases.js";

export const noFinallyCases: readonly RuleCases[] = [
  {
    valid: ["try { loadProject(); } catch (caught) { reportFailure(caught); }"],
    invalid: [
      {
        code: "try { loadProject(); } finally { closeSession(); }",
        errors: [{ messageId: "finally" }],
      },
    ],
  },
];
