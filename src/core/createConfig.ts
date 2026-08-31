import { defineConfig } from "oxlint";

import { rules, type ArchitectureRuleId } from "../rules/index.js";
import type {
  OxlintRuleConfiguration,
  Severity,
} from "./defineRule.js";

type MutableOxlintConfiguration = Severity | [Severity, ...unknown[]];

type RuleOverride =
  | Severity
  | {
      readonly severity: Severity;
      readonly reason: string;
    };

type ConfigOptions = {
  readonly rules?: Partial<Record<ArchitectureRuleId, RuleOverride>>;

  readonly overrides?: readonly {
    readonly files: readonly string[];
    readonly reason: string;
    readonly rules: Partial<Record<ArchitectureRuleId, RuleOverride>>;
  }[];
};

const getSeverity = (
  override: RuleOverride | undefined,
): Severity | undefined => {
  if (override === undefined) {
    return undefined;
  }

  if (typeof override === "string") {
    return override;
  }

  return override.severity;
};

const getOxlintRuleName = (
  rule: (typeof rules)[number],
): string | undefined => {
  if (rule.enforcement.type === "oxlint") {
    return rule.enforcement.rule;
  }

  if (rule.enforcement.type !== "custom-oxlint") {
    return undefined;
  }

  return `architecture/${rule.id}`;
};

const toMutableConfiguration = (
  configuration: OxlintRuleConfiguration,
): MutableOxlintConfiguration => {
  if (typeof configuration === "string") {
    return configuration;
  }

  return [configuration[0], ...configuration.slice(1)];
};

const withSeverity = (
  configuration: OxlintRuleConfiguration,
  severity: Severity,
): MutableOxlintConfiguration => {
  if (severity === "off") {
    return "off";
  }

  if (typeof configuration === "string") {
    return severity;
  }

  return [severity, ...configuration.slice(1)];
};

const toOxlintEntry = (
  rule: (typeof rules)[number],
  override: RuleOverride | undefined,
): readonly [string, MutableOxlintConfiguration] | undefined => {
  const oxlintRuleName = getOxlintRuleName(rule);
  if (oxlintRuleName === undefined) {
    return undefined;
  }

  if (rule.enforcement.type !== "oxlint" && rule.enforcement.type !== "custom-oxlint") {
    return undefined;
  }

  const severity = getSeverity(override);
  if (severity === undefined) {
    return [oxlintRuleName, toMutableConfiguration(rule.enforcement.configuration)];
  }

  return [oxlintRuleName, withSeverity(rule.enforcement.configuration, severity)];
};

const findRule = (architectureRuleId: string) => {
  return rules.find((candidate) => candidate.id === architectureRuleId);
};

export const createConfig = (options: ConfigOptions = {}) => {
  const configuredRules = Object.fromEntries(
    rules.flatMap((rule) => {
      const entry = toOxlintEntry(rule, options.rules?.[rule.id]);
      if (entry === undefined) {
        return [];
      }

      return [entry];
    }),
  );

  const overrides = options.overrides?.map((override) => ({
    files: [...override.files],
    rules: Object.fromEntries(
      Object.entries(override.rules).flatMap(
        ([architectureRuleId, ruleOverride]) => {
          const rule = findRule(architectureRuleId);
          if (rule === undefined) {
            return [];
          }

          const entry = toOxlintEntry(rule, ruleOverride);
          if (entry === undefined) {
            return [];
          }

          return [entry];
        },
      ),
    ),
  }));

  return defineConfig({
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "react",
      "jsx-a11y",
      "promise",
    ],

    jsPlugins: [
      {
        name: "architecture",
        specifier: "architecture-rules/plugin",
      },
    ],

    options: {
      typeAware: true,
    },

    rules: configuredRules,

    ...(overrides === undefined ? {} : { overrides }),
  });
};
