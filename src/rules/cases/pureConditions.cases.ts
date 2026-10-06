import type { RuleCases } from "../../core/ruleCases.js";

export const pureConditionsCases: readonly RuleCases[] = [
  {
    valid: [
      "if (hasAccess(project)) { publish(project); }",
      "const isReady = hasAccess(project) && isProjectActive(project);",
      "if (registerPredicate(() => { count++; })) { publish(); }",
      "const label = suppliedName ?? getDefaultName();",
      "const publish = async () => { if (isReady) { await publishProject(); } };",
    ],
    invalid: [
      "if (project = loadProject()) { publish(project); }",
      "if (count++ > 0) { publish(); }",
      "if (delete project.name) { publish(); }",
      "const publish = async () => { if (await hasAccess(project)) { publishProject(); } };",
      "const ready = isReady && count++;",
      "const label = (count++, isReady) ? 'Ready' : 'Other';",
      "if ((() => { count++; return isReady; })()) { publish(); }",
      "if (new Project()) { publish(); }",
    ].map((code) => ({ code, errors: [{ messageId: "effect" }] })),
  },
];
