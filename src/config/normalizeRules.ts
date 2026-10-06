import type { Rule } from "eslint";

import type { OxlintRuleConfiguration, Severity } from "../core/defineRule.js";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { rules } from "../rules/index.js";
import { RULE_SETTING_FIELDS, SEVERITIES } from "./configuration.constants.js";
import { matchesSchema } from "./jsonSchema.js";
import { nativeSchema } from "./nativeSchema.state.js";
import type { EffectivePolicy, EffectiveRule, RegisteredRule } from "./types.js";
import { checked, type Checked } from "./validation.js";

type EffectiveRules = EffectivePolicy["rules"];
type ParsedSetting = { readonly severity: unknown; readonly options: readonly unknown[]; readonly reason?: string };

const ruleDefaultOrigin = "rule default";

const isSeverity = (value: unknown): value is Severity => SEVERITIES.some((severity) => severity === value);

const invalidOptions = (id: string, options: readonly unknown[]): string => `Invalid options for ${id}: ${JSON.stringify(options)}`;

const nativeRuleSchema = (root: Readonly<Record<string, unknown>>, ruleName: string): unknown => {
  const { definitions } = root;
  const ruleMap = isRecord(definitions) ? definitions.DummyRuleMap : undefined;
  const properties = isRecord(ruleMap) ? ruleMap.properties : undefined;
  return isRecord(properties) ? properties[ruleName] : undefined;
};

const nativeOptionIssues = (id: string, ruleName: string, options: readonly unknown[]): readonly string[] => {
  const root = nativeSchema();
  if (root instanceof ArchitectureError) return root.issues;
  return matchesSchema(["error", ...options], nativeRuleSchema(root, ruleName), root) ? [] : [invalidOptions(id, options)];
};

const customOptionIssues = (rule: RegisteredRule, implementation: Rule.RuleModule, options: readonly unknown[]): readonly string[] => {
  const schema = "options" in rule ? rule.options.schema : implementation.meta?.schema ?? [];
  const tupleSchema = isUnknownArray(schema) ? { type: "array", items: schema, maxItems: schema.length, additionalItems: false } : schema;
  if (!matchesSchema(options, tupleSchema)) return [invalidOptions(rule.id, options)];
  return "options" in rule ? rule.options.validate?.(options) ?? [] : [];
};

/** Every problem with a rule's options; an empty list means they are valid. */
export const validateOptions = (id: string, options: readonly unknown[]): readonly string[] => {
  const rule = rules.find((candidate) => candidate.id === id);
  if (rule === undefined) return [`Unknown rule: ${id}`];
  const { enforcement } = rule;
  switch (enforcement.type) {
    case "oxlint":
      return nativeOptionIssues(id, enforcement.rule, options);
    case "custom-oxlint":
      return customOptionIssues(rule, enforcement.implementation, options);
    case "typescript":
    case "advisory":
    case "architecture":
      return options.length > 0 ? [`${id} does not accept options`] : [];
  }
};

const fromConfiguration = (configuration: OxlintRuleConfiguration): EffectiveRule => {
  if (isString(configuration)) return { severity: configuration, options: [], origin: ruleDefaultOrigin };
  const [severity, ...options] = configuration;
  return { severity, options, origin: ruleDefaultOrigin };
};

const defaultRule = (rule: RegisteredRule): EffectiveRule => {
  const { enforcement } = rule;
  switch (enforcement.type) {
    case "oxlint":
    case "custom-oxlint":
      return fromConfiguration(enforcement.configuration);
    case "typescript":
    case "advisory":
    case "architecture":
      return { severity: "error", options: [], origin: ruleDefaultOrigin };
  }
};

export const defaultRules = (): EffectiveRules => Object.fromEntries(rules.map((rule) => [rule.id, defaultRule(rule)]));

const settingOptions = (setting: Readonly<Record<string, unknown>>, previous: EffectiveRule): readonly unknown[] => {
  if (!("options" in setting)) return previous.options;
  return isUnknownArray(setting.options) ? setting.options : [setting.options];
};

const parseDetailedSetting = (id: string, setting: Readonly<Record<string, unknown>>, previous: EffectiveRule): Checked<ParsedSetting> => {
  const unknownFields = Object.keys(setting).filter((key) => !RULE_SETTING_FIELDS.some((field) => field === key));
  const { reason } = setting;
  const hasReason = isString(reason) && reason.trim().length > 0;
  const issues = [
    ...(unknownFields.length > 0 ? [`Unknown setting field for ${id}`] : []),
    ...(hasReason ? [] : [`${id} requires a nonempty reason`]),
  ];
  const parsed = { severity: setting.severity ?? previous.severity, options: settingOptions(setting, previous) };
  return checked(hasReason ? { ...parsed, reason } : parsed, issues);
};

const parseSetting = (id: string, setting: unknown, previous: EffectiveRule): Checked<ParsedSetting> => {
  if (isString(setting)) return checked({ severity: setting, options: previous.options });
  if (isUnknownArray(setting)) return checked({ severity: setting.at(0), options: setting.slice(1) });
  if (isRecord(setting)) return parseDetailedSetting(id, setting, previous);
  return checked({ severity: previous.severity, options: previous.options }, [`Invalid setting for ${id}`]);
};

/** Overrides that this rule's kind never accepts, whatever the setting. */
const scopeIssue = (rule: RegisteredRule, project: boolean): string | undefined => {
  const { id, enforcement } = rule;
  if (enforcement.type === "architecture") return `${id} is a mandatory structural check`;
  const isRunnerControlled = id === "file-naming" || id === "allowed-imports";
  if (isRunnerControlled) return "Use naming/imports, not a direct architecture rule override";
  const isFileTypeCompilerRule = !project && enforcement.type === "typescript";
  return isFileTypeCompilerRule ? `${id} is a project-wide compiler requirement, not a file-type rule` : undefined;
};

const severityIssues = (rule: RegisteredRule, severity: unknown): readonly string[] => {
  if (!isSeverity(severity)) return [`Invalid severity for ${rule.id}`];
  const isCompilerWarning = rule.enforcement.type === "typescript" && severity === "warn";
  return isCompilerWarning ? [`${rule.id} supports error/off only`] : [];
};

const overrideRule = (rule: RegisteredRule, setting: unknown, previous: EffectiveRule, origin: string, project: boolean): Checked<EffectiveRule | undefined> => {
  const unsupported = scopeIssue(rule, project);
  if (unsupported !== undefined) return checked(undefined, [unsupported]);
  const parsed = parseSetting(rule.id, setting, previous);
  const { severity, options, reason } = parsed.value;
  const issues = [...parsed.issues, ...severityIssues(rule, severity), ...validateOptions(rule.id, options)];
  if (!isSeverity(severity)) return checked(undefined, issues);
  return checked({ severity, options, origin, ...(reason === undefined ? {} : { reason }) }, issues);
};

const overrideEntry = (id: string, setting: unknown, inherited: EffectiveRules, origin: string, project: boolean): Checked<EffectiveRule | undefined> => {
  const rule = rules.find((candidate) => candidate.id === id);
  const previous = inherited[id];
  const isKnownRule = rule !== undefined && previous !== undefined;
  if (!isKnownRule) return checked(undefined, [`Unknown rule: ${id}`]);
  return overrideRule(rule, setting, previous, origin, project);
};

/** Applies one rules map on top of inherited settings: severity-only changes keep options, explicit options replace them. */
export const overrideRules = (inherited: EffectiveRules, input: unknown, origin: string, project: boolean): Checked<EffectiveRules> => {
  if (input === undefined) return checked(inherited);
  if (!isRecord(input)) return checked(inherited, [`${origin}.rules must be an object`]);
  const overrides = Object.entries(input).map(([id, setting]) => ({ id, result: overrideEntry(id, setting, inherited, origin, project) }));
  const effective = overrides.flatMap(({ id, result }) => result.value === undefined ? [] : [[id, result.value] as const]);
  return checked({ ...inherited, ...Object.fromEntries(effective) }, overrides.flatMap(({ result }) => result.issues));
};
