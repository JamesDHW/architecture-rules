import { defineRule } from "../core/defineRule.js";
import type { OxlintRuleConfiguration } from "../core/defineRule.js";

export const defineNativeOxlintRule = <const Id extends string>(rule: {
  readonly id: Id;
  readonly title: string;
  readonly description: string;
  readonly rule: string;
  readonly configuration: OxlintRuleConfiguration;
}) => {
  return defineRule({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    enforcement: {
      type: "oxlint",
      rule: rule.rule,
      configuration: rule.configuration,
    },
  });
};
