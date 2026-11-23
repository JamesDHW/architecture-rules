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

type NativeRuleName = { readonly id: string; readonly ruleName: string };

const nativeOptionIssues = ({ id, ruleName }: NativeRuleName, options: readonly unknown[]): readonly string[] => {
  const root = nativeSchema();
  if (root instanceof ArchitectureError) return root.issues;
  return matchesSchema(["error", ...options], nativeRuleSchema(root, ruleName), root) ? [] : [invalidOptions(id, options)];
};

type CustomRule = { readonly rule: RegisteredRule; readonly implementation: Rule.RuleModule };

const customOptionIssues = ({ rule, implementation }: CustomRule, options: readonly unknown[]): readonly string[] => {
  const schema = "options" in rule ? rule.options.schema : implementation.meta?.schema ?? [];
  const tupleSchema = isUnknownArray(schema) ? { type: "array", items: schema, maxItems: schema.length, additionalItems: false } : schema;
  if (!matchesSchema(options, tupleSchema)) return [invalidOptions(rule.id, options)];
  return "options" in rule ? rule.options.validate?.(options) ?? [] : [];
};

/** Options for rules the checker itself applies, validated against the schema the rule declares. */
const checkerOptionIssues = (rule: RegisteredRule, options: readonly unknown[]): readonly string[] => {
  if (!("options" in rule)) return options.length > 0 ? [`${rule.id} does not accept options`] : [];
  const { schema } = rule.options;
  const tupleSchema = isUnknownArray(schema) ? { type: "array", items: schema, maxItems: schema.length, additionalItems: false } : schema;
  if (!matchesSchema(options, tupleSchema)) return [invalidOptions(rule.id, options)];
  return rule.options.validate?.(options) ?? [];
};

/** Every problem with a rule's options; an empty list means they are valid. */
// architecture-disable-next-line production-reachability -- Tests check each rule's option schema directly.
export const validateOptions = (id: string, options: readonly unknown[]): readonly string[] => {
  const rule = rules.find((candidate) => candidate.id === id);
  if (rule === undefined) return [`Unknown rule: ${id}`];
  const { enforcement } = rule;
  switch (enforcement.type) {
    case "oxlint":
      return nativeOptionIssues({ id, ruleName: enforcement.rule }, options);
    case "custom-oxlint":
      return customOptionIssues({ rule, implementation: enforcement.implementation }, options);
    case "dead-code":
    case "program":
    case "glossary":
    case "configuration":
      return checkerOptionIssues(rule, options);
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
    case "dead-code":
    case "program":
    case "glossary":
    case "configuration":
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

/** The rule a setting is for, and the setting it replaces. */
type SettingTarget = { readonly id: string; readonly previous: EffectiveRule };

const parseDetailedSetting = ({ id, previous }: SettingTarget, setting: Readonly<Record<string, unknown>>): Checked<ParsedSetting> => {
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

const parseSetting = (target: SettingTarget, setting: unknown): Checked<ParsedSetting> => {
  const { id, previous } = target;
  if (isString(setting)) return checked({ severity: setting, options: previous.options });
  if (isUnknownArray(setting)) return checked({ severity: setting.at(0), options: setting.slice(1) });
  if (isRecord(setting)) return parseDetailedSetting(target, setting);
  return checked({ severity: previous.severity, options: previous.options }, [`Invalid setting for ${id}`]);
};

/** Overrides that this rule's kind never accepts, whatever the setting. */
const scopeIssue = (rule: RegisteredRule, project: boolean): string | undefined => {
  const { id, enforcement } = rule;
  if (enforcement.type === "architecture") return `${id} is a mandatory structural check`;
  const isRunnerControlled = id === "file-naming" || id === "allowed-imports";
  if (isRunnerControlled) return "Use naming/imports, not a direct architecture rule override";
  const isLayerCompilerRule = !project && enforcement.type === "typescript";
  if (isLayerCompilerRule) return `${id} is a project-wide compiler requirement, not a layer rule`;
  const isProjectScoped = enforcement.type === "configuration" || (enforcement.type === "dead-code" && enforcement.scope === "project");
  const isLayerProjectRule = !project && isProjectScoped;
  return isLayerProjectRule ? `${id} applies to the whole project; set it in the top-level rules` : undefined;
};

const severityIssues = (rule: RegisteredRule, severity: unknown): readonly string[] => {
  if (!isSeverity(severity)) return [`Invalid severity for ${rule.id}`];
  const isCompilerWarning = rule.enforcement.type === "typescript" && severity === "warn";
  return isCompilerWarning ? [`${rule.id} supports error/off only`] : [];
};

/** Where a rules map is applied: what it inherits, the label its issues name, and whether it is the project's own. */
export type RulesScope = { readonly inherited: EffectiveRules; readonly origin: string; readonly project: boolean };

type Override = { readonly rule: RegisteredRule; readonly previous: EffectiveRule; readonly origin: string; readonly project: boolean };

const overrideRule = ({ rule, previous, origin, project }: Override, setting: unknown): Checked<EffectiveRule | undefined> => {
  const unsupported = scopeIssue(rule, project);
  if (unsupported !== undefined) return checked(undefined, [unsupported]);
  const parsed = parseSetting({ id: rule.id, previous }, setting);
  const { severity, options, reason } = parsed.value;
  const issues = [...parsed.issues, ...severityIssues(rule, severity), ...validateOptions(rule.id, options)];
  if (!isSeverity(severity)) return checked(undefined, issues);
  return checked({ severity, options, origin, ...(reason === undefined ? {} : { reason }) }, issues);
};

const overrideEntry = ({ inherited, origin, project }: RulesScope, [id, setting]: readonly [string, unknown]): Checked<EffectiveRule | undefined> => {
  const rule = rules.find((candidate) => candidate.id === id);
  const previous = inherited[id];
  const isKnownRule = rule !== undefined && previous !== undefined;
  if (!isKnownRule) return checked(undefined, [`Unknown rule: ${id}`]);
  return overrideRule({ rule, previous, origin, project }, setting);
};

/** Applies one rules map on top of inherited settings: severity-only changes keep options, explicit options replace them. */
export const overrideRules = (scope: RulesScope, input: unknown): Checked<EffectiveRules> => {
  const { inherited, origin } = scope;
  if (input === undefined) return checked(inherited);
  if (!isRecord(input)) return checked(inherited, [`${origin}.rules must be an object`]);
  const overrides = Object.entries(input).map((entry) => ({ id: entry[0], result: overrideEntry(scope, entry) }));
  const effective = overrides.flatMap(({ id, result }) => result.value === undefined ? [] : [[id, result.value] as const]);
  return checked({ ...inherited, ...Object.fromEntries(effective) }, overrides.flatMap(({ result }) => result.issues));
};
