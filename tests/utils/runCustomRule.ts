import { RuleTester } from "oxlint/plugins-dev";
import { assert, describe, it } from "vitest";

import type { ArchitectureRule } from "../../src/core/defineRule.js";

type RuleTests = Parameters<RuleTester["run"]>[2];

RuleTester.describe = describe;
RuleTester.it = it;

export const runCustomRule = (rule: ArchitectureRule, tests: RuleTests, lang: "ts" | "tsx" = "ts"): void => {
  const { enforcement } = rule;
  assert(enforcement.type === "custom-oxlint", `${rule.id} must be a custom Oxlint rule`);
  const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang } } });
  // oxlint-disable-next-line architecture/no-type-assertions -- Rules are typed as ESLint modules; Oxlint's RuleTester declares a structurally different module type for the same runtime shape.
  const implementation = enforcement.implementation as unknown as Parameters<RuleTester["run"]>[1];
  ruleTester.run(rule.id, implementation, tests);
};
