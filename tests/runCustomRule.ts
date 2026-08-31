import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import type { ArchitectureRule } from "../src/core/defineRule.js";

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

  ruleTester.run(rule.id, rule.enforcement.implementation, tests);
};
