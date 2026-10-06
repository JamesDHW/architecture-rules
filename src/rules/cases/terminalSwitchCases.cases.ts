import type { RuleCases } from "../../core/ruleCases.js";

export const terminalSwitchCasesCases: readonly RuleCases[] = [
  {
    valid: [
      "const handle = () => { switch (status) { case 'idle': case 'loading': return pending; default: return ready; } };",
      "const handle = () => { switch (status) { case 'idle': { return pending; } default: { return ready; } } };",
      "const handle = () => { switch (status) { case 'idle': return pending; default: return status satisfies never; } };",
    ],
    invalid: [
      {
        code: "switch (status) { case 'idle': publish(); break; }",
        errors: [{ messageId: "terminal" }],
      },
      {
        code: "switch (status) { case 'idle': }",
        errors: [{ messageId: "terminal" }],
      },
      {
        code: "const handle = () => { switch (status) { case 'idle': if (isReady) return ready; } };",
        errors: [{ messageId: "terminal" }],
      },
      {
        code: "const handle = () => { switch (status) { case 'idle': { publish(); { return pending; } } case 'ready': { if (isReady) return ready; } } };",
        errors: [{ messageId: "terminal" }],
      },
      {
        code: "const handle = () => { switch (true) { case isReady: return ready; } };",
        errors: [{ messageId: "predicateSwitch" }],
      },
      {
        code: "const handle = () => { switch (false) { case isReady: return ready; } };",
        errors: [{ messageId: "predicateSwitch" }],
      },
    ],
  },
];
