import type { RuleCases } from "../../core/ruleCases.js";

export const collectionLoopsCases: readonly RuleCases[] = [
  {
    valid: [
      "for (const project of projects) { publishProject(project); }",
      "const publish = async () => { for await (const project of projects) { await publishProject(project); } };",
    ],
    invalid: [
      "for (;;) {}",
      "for (const projectId in projects) {}",
      "while (isReady) {}",
      "do {} while (isReady);",
    ].map((code) => ({ code, errors: [{ messageId: "loop" }] })),
  },
];
