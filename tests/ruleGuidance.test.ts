import { describe, expect, it } from "vitest";

import type { ArchitectureRule, RuleEvasion } from "../src/core/defineRule.js";
import { ruleCases } from "../src/rules/cases/ruleCases.js";
import { rules } from "../src/rules/index.js";
import { runReportedOnce, type NamedCode } from "./utils/runCustomRule.js";

const allRules = rules.map((rule): ArchitectureRule => rule);
const rulesById = new Map(allRules.map((rule) => [rule.id, rule]));
const isLintRule = (rule: ArchitectureRule): boolean => rule.enforcement.type === "oxlint" || rule.enforcement.type === "custom-oxlint";
const isCustomRule = (rule: ArchitectureRule | undefined): rule is ArchitectureRule => rule?.enforcement.type === "custom-oxlint";

type EvasionOf = { readonly rule: ArchitectureRule; readonly evasion: RuleEvasion };
const evasions: readonly EvasionOf[] = allRules.flatMap((rule) => (rule.evasions ?? []).map((evasion) => ({ rule, evasion })));
const namedCode = ({ evasion }: EvasionOf): NamedCode => ({ name: evasion.name, code: evasion.code, lang: evasion.lang ?? "ts" });

describe("rule guidance", () => {
  it("tells every lint rule's findings what to write instead", () => {
    expect(allRules.filter(isLintRule).filter((rule) => rule.instead === undefined).map((rule) => rule.id)).toEqual([]);
  });

  it("names only custom rules as catching a workaround", () => {
    const catchers = evasions.flatMap(({ evasion }) => (evasion.caughtBy === undefined ? [] : [evasion.caughtBy]));
    expect(catchers.filter((ruleId) => !isCustomRule(rulesById.get(ruleId)))).toEqual([]);
  });

  it("keys test cases by existing rule ids", () => {
    expect(Object.keys(ruleCases).filter((ruleId) => !rulesById.has(ruleId))).toEqual([]);
  });
});

// A workaround the documentation says a rule catches must be reported by that rule.
for (const catcher of allRules.filter(isCustomRule)) {
  const caught = evasions.filter(({ evasion }) => evasion.caughtBy === catcher.id).map(namedCode);
  // A workaround documented as uncaught must still pass the rule it evades, so the page stays true when rules change.
  const uncaught = evasions.filter(({ rule, evasion }) => rule.id === catcher.id && evasion.caughtBy === undefined).map(namedCode);
  if (caught.length + uncaught.length > 0) {
    runReportedOnce(catcher, caught, uncaught);
  }
}
