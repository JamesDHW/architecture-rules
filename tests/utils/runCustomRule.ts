import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import type { ArchitectureRule } from "../../src/core/defineRule.js";

RuleTester.describe = describe;
RuleTester.it = it;

export const runCustomRule = (
  rule: ArchitectureRule,
  tests: {
    valid: Parameters<RuleTester["run"]>[2]["valid"];
    invalid: Parameters<RuleTester["run"]>[2]["invalid"];
  },
  lang: "ts" | "tsx" = "ts",
) => {
  if (rule.enforcement.type !== "custom-oxlint") {
    throw new Error(`${rule.id} must be a custom Oxlint rule`);
  }

  const ruleTester = new RuleTester({
    languageOptions: { parserOptions: { lang } },
  });

  // Oxlint accepts ESLint-compatible modules, but its optional metadata types differ.
  const implementation = rule.enforcement.implementation as unknown as Parameters<RuleTester["run"]>[1];
  ruleTester.run(rule.id, implementation, tests);
};
