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

/**
 * Checked over the whole program by the dead-code stage: unused files, exports and dependencies.
 * file-scoped rules can be set per layer; project-scoped ones (dependencies, binaries) only project-wide.
 */
type DeadCodeEnforcement = {
  readonly type: "dead-code";
  readonly scope: "file" | "project";
  readonly configuration: Severity;
};

/**
 * Checked by the checker against the glossaries a layer follows: the names its files declare, and their types.
 * Can be set per layer, and runs only in layers that follow a glossary.
 */
type GlossaryEnforcement = {
  readonly type: "glossary";
  readonly configuration: Severity;
};

/** Checked by the checker against architecture.config.ts and the project's setup; set only project-wide. */
type ConfigurationEnforcement = {
  readonly type: "configuration";
  readonly configuration: Severity;
};

type Enforcement =
  | OxlintEnforcement
  | CustomOxlintEnforcement
  | TypeScriptEnforcement
  | AdvisoryEnforcement
  | DeadCodeEnforcement
  | GlossaryEnforcement
  | ConfigurationEnforcement
  | { readonly type: "architecture" };

/** Code that satisfies a rule's wording while missing its point. Rendered in the rule's generated documentation. */
export type RuleEvasion = {
  readonly name: string;
  readonly code: string;
  readonly lang?: "ts" | "tsx";
  /** What the workaround loses, and what to write instead. */
  readonly why: string;
  /** The custom rule that reports this workaround. Omitted when no rule does, so review has to. */
  readonly caughtBy?: string;
};

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

  /** One line saying what to write instead. The checker prints it after this rule's findings. */
  readonly instead?: string;

  /** When a reasoned suppression is better than changing the code. */
  readonly suppressWhen?: string;

  /** Known ways to satisfy the rule's wording while missing its point. */
  readonly evasions?: readonly RuleEvasion[];
};

export const defineRule = <const RuleDefinition extends ArchitectureRule>(
  rule: RuleDefinition,
): RuleDefinition => {
  return rule;
};

/** Custom option types and runtime schema travel with their canonical rule. */
export type RuleOptions<Options extends readonly unknown[]> = {
  readonly schema: NonNullable<NonNullable<Rule.RuleModule["meta"]>["schema"]>;
  readonly validate?: (options: readonly unknown[]) => readonly string[];
  /** Type-only witness; no value is emitted. */
  readonly tuple?: Options;
};

export const defineRuleOptions = <Options extends readonly unknown[]>(
  schema: RuleOptions<Options>["schema"],
  validate?: (options: readonly unknown[]) => readonly string[],
): RuleOptions<Options> => ({ schema, ...(validate === undefined ? {} : { validate }) });
