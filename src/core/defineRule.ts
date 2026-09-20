import type { Rule } from "eslint";

export type Severity = "off" | "warn" | "error";

export type OxlintRuleConfiguration =
  | Severity
  | readonly [Severity, ...(readonly unknown[])];

type OxlintEnforcement = {
  readonly type: "oxlint";
  readonly rule: string;
  readonly configuration: OxlintRuleConfiguration;
};

type CustomOxlintEnforcement = {
  readonly type: "custom-oxlint";
  readonly configuration: OxlintRuleConfiguration;
  readonly implementation: Rule.RuleModule;
};

type TypeScriptEnforcement = {
  readonly type: "typescript";
  readonly compilerOptions: Readonly<Record<string, unknown>>;
};

type AdvisoryEnforcement = {
  readonly type: "advisory";
};

export type Enforcement =
  | OxlintEnforcement
  | CustomOxlintEnforcement
  | TypeScriptEnforcement
  | AdvisoryEnforcement
  | { readonly type: "architecture" };

export type ArchitectureRule<Id extends string = string> = {
  readonly id: Id;
  readonly title: string;

  /**
   * This is the canonical documentation for the rule.
   *
   * Do not maintain a separate prose version elsewhere.
   */
  readonly description: string;

  readonly enforcement: Enforcement;
};

export const defineRule = <const RuleDefinition extends ArchitectureRule>(
  rule: RuleDefinition,
): RuleDefinition => {
  return rule;
};

/** Custom option types and runtime schema travel with their canonical rule. */
export type RuleOptions<Options extends readonly unknown[]> = {
  readonly schema: NonNullable<NonNullable<Rule.RuleModule["meta"]>["schema"]>;
  readonly validate?: (options: readonly unknown[]) => void;
  /** Type-only witness; no value is emitted. */
  readonly tuple?: Options;
};

export const defineRuleOptions = <Options extends readonly unknown[]>(
  schema: RuleOptions<Options>["schema"],
  validate?: (options: readonly unknown[]) => void,
): RuleOptions<Options> => ({ schema, ...(validate === undefined ? {} : { validate }) });
