import { RuleTester } from "oxlint/plugins-dev";
import { assert, describe, it } from "vitest";

import type { ArchitectureRule } from "../../src/core/defineRule.js";
import type { InvalidCase, RuleCases, ValidCase } from "../../src/core/ruleCases.js";

type RuleTests = Parameters<RuleTester["run"]>[2];
type TesterValidCase = RuleTests["valid"][number];
type TesterInvalidCase = RuleTests["invalid"][number];

RuleTester.describe = describe;
RuleTester.it = it;

const toTesterValidCase = (testCase: ValidCase): TesterValidCase => {
  if (typeof testCase === "string") return testCase;
  const { options, ...rest } = testCase;
  return { ...rest, ...(options === undefined ? {} : { options: [...options] }) };
};

const toTesterInvalidCase = ({ errors, options, ...rest }: InvalidCase): TesterInvalidCase => ({
  ...rest,
  ...(options === undefined ? {} : { options: [...options] }),
  errors: errors.map((error) => ({ ...error })),
});

const testerImplementation = (rule: ArchitectureRule): Parameters<RuleTester["run"]>[1] => {
  const { enforcement } = rule;
  assert(enforcement.type === "custom-oxlint", `${rule.id} must be a custom Oxlint rule`);
  // architecture-disable-next-line no-type-assertions -- Rules are typed as ESLint modules; Oxlint's RuleTester declares a structurally different module type for the same runtime shape.
  return enforcement.implementation as unknown as Parameters<RuleTester["run"]>[1];
};

/** Runs every set of a custom rule's cases through Oxlint's RuleTester. */
export const runCustomRule = (rule: ArchitectureRule, caseSets: readonly RuleCases[]): void => {
  const implementation = testerImplementation(rule);
  for (const { lang = "ts", valid, invalid } of caseSets) {
    const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang } } });
    ruleTester.run(rule.id, implementation, { valid: valid.map(toTesterValidCase), invalid: invalid.map(toTesterInvalidCase) });
  }
};

export type NamedCode = { readonly name: string; readonly code: string; readonly lang: "ts" | "tsx" };

/** Checks that the rule reports each code in reported exactly once, and nothing in allowed. */
export const runReportedOnce = (rule: ArchitectureRule, reported: readonly NamedCode[], allowed: readonly NamedCode[]): void => {
  const implementation = testerImplementation(rule);
  for (const lang of ["ts", "tsx"] as const) {
    const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang } } });
    const valid = allowed.filter((example) => example.lang === lang).map(({ name, code }) => ({ name, code }));
    const invalid = reported.filter((example) => example.lang === lang).map(({ name, code }) => ({ name, code, errors: 1 }));
    if (valid.length + invalid.length > 0) {
      ruleTester.run(rule.id, implementation, { valid, invalid });
    }
  }
};
