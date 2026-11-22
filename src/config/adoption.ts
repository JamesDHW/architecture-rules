import { isRecord } from "../core/guards.js";
import { rules } from "../rules/index.js";
import { ADOPTION_FIELDS, ADOPTION_MODES, NO_NEW_ON_TOUCH, ON_TOUCH_FIELDS, TOUCH_POLICIES } from "./configuration.constants.js";
import type { Adoption, TouchPolicy } from "./types.js";
import { checked, fields, type Checked } from "./validation.js";

type Mode = Adoption["mode"];

const ruleIds: ReadonlySet<string> = new Set(rules.map((rule) => rule.id));

const isMode = (value: unknown): value is Mode => ADOPTION_MODES.some((mode) => mode === value);

const isTouchPolicy = (value: unknown): value is TouchPolicy => TOUCH_POLICIES.some((policy) => policy === value);

const builtInRules: Readonly<Record<string, TouchPolicy>> = Object.fromEntries(NO_NEW_ON_TOUCH.map((id) => [id, "no-new"]));

const touchPolicy = (value: unknown, label: string): Checked<TouchPolicy> => {
  return isTouchPolicy(value) ? checked(value) : checked("fix", [`${label} must be ${TOUCH_POLICIES.join(" or ")}`]);
};

const ruleIssues = (id: string, value: unknown, label: string): readonly string[] => {
  const unknownRule = ruleIds.has(id) ? [] : [`${label}: unknown rule ${id}`];
  return [...unknownRule, ...touchPolicy(value, `${label}.${id}`).issues];
};

const touchRules = (value: unknown, label: string): Checked<Readonly<Record<string, TouchPolicy>>> => {
  if (value === undefined) return checked(builtInRules);
  if (!isRecord(value)) return checked(builtInRules, [`${label} must be an object`]);
  const entries = Object.entries(value);
  const valid = entries.filter((entry): entry is [string, TouchPolicy] => ruleIds.has(entry[0]) && isTouchPolicy(entry[1]));
  return checked({ ...builtInRules, ...Object.fromEntries(valid) }, entries.flatMap(([id, policy]) => ruleIssues(id, policy, label)));
};

const onTouch = (value: unknown, label: string): Checked<Adoption["onTouch"]> => {
  if (value === undefined) return checked({ default: "fix", rules: builtInRules });
  const input = fields(value, ON_TOUCH_FIELDS, label);
  const fallback = input.value.default === undefined ? checked<TouchPolicy>("fix") : touchPolicy(input.value.default, `${label}.default`);
  const byRule = touchRules(input.value.rules, `${label}.rules`);
  return checked({ default: fallback.value, rules: byRule.value }, [...input.issues, ...fallback.issues, ...byRule.issues]);
};

/** adoption: observe or enforce, and which rules a changed file must fix. Absent means enforce, and fix every rule but imports. */
export const adoption = (value: unknown): Checked<Adoption> => {
  if (value === undefined) return checked({ mode: "enforce", onTouch: { default: "fix", rules: builtInRules } });
  const input = fields(value, ADOPTION_FIELDS, "adoption");
  const { mode } = input.value;
  const isValidMode = mode === undefined || isMode(mode);
  const modeIssues = isValidMode ? [] : [`adoption.mode must be ${ADOPTION_MODES.join(" or ")}`];
  const touch = onTouch(input.value.onTouch, "adoption.onTouch");
  return checked({ mode: isMode(mode) ? mode : "enforce", onTouch: touch.value }, [...input.issues, ...modeIssues, ...touch.issues]);
};

/** The touch policy of one rule: its own setting, otherwise the default. */
export const touchPolicyFor = (setting: Adoption, ruleId: string): TouchPolicy => setting.onTouch.rules[ruleId] ?? setting.onTouch.default;
