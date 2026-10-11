import type { OxlintConfig } from "oxlint";
import type { Severity } from "../core/defineRule.js";
import type { rules } from "../rules/index.js";
import type { RuleOptions } from "../core/defineRule.js";
import type { NamingPolicy } from "../rules/namingPolicy.js";

export type { NamingPolicy };

export type RegisteredRule = (typeof rules)[number];
export type RuleId = RegisteredRule["id"];
type RuleById<K extends RuleId> = Extract<RegisteredRule, { readonly id: K }>;
type NativeRules = NonNullable<OxlintConfig["rules"]>;
type Tail<T> = T extends readonly [unknown, ...infer Options] ? Options : never;
type NativeOptions<N> = N extends keyof NativeRules ? Tail<NativeRules[N]> : never;
type CustomOptions<K extends RuleId> = RuleById<K> extends { readonly options: RuleOptions<infer O> } ? O : [];
export type OptionsFor<K extends RuleId> = RuleById<K>["enforcement"] extends { readonly type: "oxlint"; readonly rule: infer N }
  ? NativeOptions<N> : CustomOptions<K>;
type DeepReadonly<T> = T extends readonly unknown[] ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
type ObjectOptions<O extends readonly unknown[]> = Exclude<O[0], undefined> extends infer First
  ? First extends object ? First extends readonly unknown[] ? never : O["length"] extends 0 | 1 ? First : never : never : never;
type Detail<O extends readonly unknown[]> = {
  readonly severity?: Severity;
  readonly reason: string;
} & (O extends readonly [] ? { readonly options?: never } : { readonly options?: DeepReadonly<O> | DeepReadonly<ObjectOptions<O>> });
export type RuleSetting<K extends RuleId> = Severity | readonly [Severity, ...DeepReadonly<OptionsFor<K>>] | Detail<OptionsFor<K>>;
export type CompilerRuleId = Extract<RegisteredRule, { readonly enforcement: { readonly type: "typescript" } }>["id"];
type StructuralRuleId = Extract<RegisteredRule, { readonly enforcement: { readonly type: "architecture" } }>["id"];
export type FileRuleId = Exclude<RuleId, StructuralRuleId | CompilerRuleId | "file-naming" | "allowed-imports">;
export type FileRules = { readonly [K in FileRuleId]?: RuleSetting<K> };
export type ProjectRules = FileRules & { readonly [K in CompilerRuleId]?: "error" | "off" | { readonly severity: "error" | "off"; readonly reason: string } };

/**
 * What a layer may import. internal names layers (including itself); external
 * names package specifiers and Node built-ins with the node: prefix; assets are
 * root-relative patterns for non-source files such as stylesheets and images.
 */
export type DependencyPolicy<Layer extends string = string> = {
  readonly internal?: readonly Layer[];
  readonly external?: readonly string[];
  readonly assets?: readonly string[];
};
export type Policy<Layer extends string = string> = {
  readonly naming?: NamingPolicy;
  readonly dependencies?: DependencyPolicy<Layer>;
  readonly rules?: FileRules;
};
/** Generator output: classified, named and import-checked, but never linted. */
export type GeneratedSetting = { readonly reason: string };
export type LayerDefinition<Layer extends string = string> = {
  readonly description: string;
  readonly files: readonly string[];
  readonly exclude?: readonly string[];
} & (
  | (Policy<Layer> & { readonly generated?: never })
  | (Omit<Policy<Layer>, "rules"> & { readonly generated: GeneratedSetting; readonly rules?: never })
);
/** The tsconfigs whose programs define the source under check; references are followed unless set to explicit. */
export type TypeScriptProjects = { readonly tsconfigs: readonly string[]; readonly references?: "follow" | "explicit" };
/**
 * Read top to bottom, the configuration follows the order decisions are made:
 * the TypeScript projects, then layers with their dependencies, then rules.
 */
export type ArchitectureInput<Layer extends string> = {
  readonly projects: TypeScriptProjects;
  readonly layers: { readonly [K in Layer]: LayerDefinition<NoInfer<Layer>> };
  /** Naming policy for every layer that does not set its own. */
  readonly naming?: NamingPolicy;
  /** Project-wide rule settings; a layer's rules override them. */
  readonly rules?: ProjectRules;
};
export type EffectiveRule = { readonly severity: Severity; readonly options: readonly unknown[]; readonly origin: string; readonly reason?: string };
export type EffectivePolicy = {
  readonly origins: { readonly naming: string; readonly dependencies: string };
  readonly naming?: NamingPolicy;
  readonly dependencies: Required<DependencyPolicy>;
  readonly rules: Readonly<Record<string, EffectiveRule>>;
  readonly generated?: GeneratedSetting;
};
export type NormalizedLayer = LayerDefinition & { readonly policy: EffectivePolicy };
export type Architecture = {
  readonly projects: Required<TypeScriptProjects>;
  /** The policy a layer inherits when it sets nothing itself. */
  readonly defaults: EffectivePolicy;
  readonly layers: Readonly<Record<string, NormalizedLayer>>;
};
