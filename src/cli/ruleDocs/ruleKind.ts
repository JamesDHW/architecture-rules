import type { ArchitectureRule, OxlintRuleConfiguration } from "../../core/defineRule.js";
import { lintRuleName } from "../../rules/lintNames.js";
import { inlineCode } from "./markdown.js";

/** What enforces the rule, in a few words. */
export const enforcementLabel = (rule: ArchitectureRule): string => {
  const { enforcement } = rule;
  switch (enforcement.type) {
    case "custom-oxlint":
      return "Lint rule";
    case "oxlint":
      return `Lint rule, built on ${inlineCode(lintRuleName(rule) ?? enforcement.rule)}`;
    case "typescript":
      return `TypeScript compiler options ${inlineCode(JSON.stringify(enforcement.compilerOptions))}`;
    case "architecture":
      return "Structural check; lint comments cannot suppress it";
    case "advisory":
      return "Advisory; nothing checks it automatically";
  }
};

const settingLabel = (configuration: OxlintRuleConfiguration): string => {
  if (typeof configuration === "string") return `${configuration} by default`;
  const [severity, ...options] = configuration;
  return `${severity} by default, with options ${inlineCode(JSON.stringify(options))}`;
};

/** The rule's default severity and options, for lint rules. */
export const defaultSetting = (rule: ArchitectureRule): string | undefined => {
  const { enforcement } = rule;
  switch (enforcement.type) {
    case "custom-oxlint":
    case "oxlint":
      return settingLabel(enforcement.configuration);
    case "typescript":
    case "architecture":
    case "advisory":
      return undefined;
  }
};
