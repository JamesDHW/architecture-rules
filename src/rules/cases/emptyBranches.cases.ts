import type { RuleCases } from "../../core/ruleCases.js";

export const emptyBranchesCases: readonly RuleCases[] = [
  {
    valid: [
      "if (isReady) { publish(); }",
      "const noop = () => {};",
      "const handle = () => { switch (status) { case 'idle': return; } };",
    ],
    invalid: [
      "if (isReady) {}",
      "if (isReady) { /* deliberate */ }",
      "if (isReady) { publish(); } else {}",
      "if (isReady);",
      "switch (status) {}",
    ].map((code) => ({ code, errors: [{ messageId: "empty" }] })),
  },
];
