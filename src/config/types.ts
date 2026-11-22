import type { OxlintConfig } from "oxlint";
import type { Severity } from "../core/defineRule.js";
import type { rules } from "../rules/index.js";
import type { RuleOptions } from "../core/defineRule.js";
import type { NamingPolicy } from "../rules/namingPolicy.js";

export type { NamingPolicy };

export type RegisteredRule = (typeof rules)[number];
type RuleId = RegisteredRule["id"];
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
type CompilerRuleId = Extract<RegisteredRule, { readonly enforcement: { readonly type: "typescript" } }>["id"];
type StructuralRuleId = Extract<RegisteredRule, { readonly enforcement: { readonly type: "architecture" } }>["id"];
type FileRuleId = Exclude<RuleId, StructuralRuleId | CompilerRuleId | "file-naming" | "allowed-imports">;
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
/**
 * Marks a layer's files as loaded from outside the program, by a bundler, router, test runner or package
 * consumer. Everything else is used only if something imports it, so an entry is where dead code can hide:
 * it needs a reason.
 */
export type EntrySetting = {
  readonly reason: string;
  /** Root-relative patterns: only these files of the layer are entries. Every file of the layer by default. */
  readonly files?: readonly string[];
  /** Exports something outside the program uses: their names, or "all" for a public API. None by default. */
  readonly exports?: readonly string[] | "all";
};
type LayerRole<GlossaryName extends string = string> = {
  /**
   * The glossaries whose terms this layer's names must use. A layer with none is not checked, so technical layers
   * keep their own vocabulary.
   */
  readonly glossary?: GlossaryName | readonly GlossaryName[];
  readonly entry?: EntrySetting;
  /** Tests, tooling and other code that never ships: it may use devDependencies and keeps no production code alive. */
  readonly development?: boolean;
};
export type LayerDefinition<Layer extends string = string, GlossaryName extends string = string> = {
  readonly description: string;
  readonly files: readonly string[];
  readonly exclude?: readonly string[];
} & LayerRole<GlossaryName> & (
  | (Policy<Layer> & { readonly generated?: never })
  | (Omit<Policy<Layer>, "rules"> & { readonly generated: GeneratedSetting; readonly rules?: never })
);
/** The tsconfigs whose programs define the source under check; references are followed unless set to explicit. */
export type TypeScriptProjects = { readonly tsconfigs: readonly string[]; readonly references?: "follow" | "explicit" };
/**
 * What happens to a baselined finding in a file someone changes: "fix" makes the file fix it before the change
 * passes; "no-new" only stops the file adding findings.
 */
export type TouchPolicy = "fix" | "no-new";
/**
 * Incremental adoption of an existing codebase. "observe" reports every finding but always exits 0, for tuning a
 * new configuration before anything is enforced.
 */
type AdoptionSettings = {
  readonly mode?: "enforce" | "observe";
  readonly onTouch?: { readonly default?: TouchPolicy; readonly rules?: { readonly [K in RuleId]?: TouchPolicy } };
};
/**
 * One word or concept, as the code must name it. The key is the term as a type would be named, such as Customer
 * or LineItem; names match it in any case and in the plural.
 */
export type TermDefinition = {
  /** What the term means here, in a sentence. Shown with every finding about the term. */
  readonly definition: string;
  /** Other words for the same thing, which names must not use: "client", "buyer", "line entry". */
  readonly avoid?: readonly string[];
  /**
   * The type that carries the term: a type, interface, class or enum declared once, at the top level of a file, in the
   * layers that follow this glossary. Then a value named after the term must have this type, and a value of this type must not be named
   * after another term or an avoided alias.
   */
  readonly type?: string;
};
/** The vocabulary of one part of the domain. Layers opt in by name. */
export type GlossaryDefinition = {
  readonly description?: string;
  readonly terms: { readonly [term: string]: TermDefinition };
};
/**
 * Read top to bottom, the configuration follows the order decisions are made:
 * the TypeScript projects, then layers with their dependencies, then rules.
 */
export type ArchitectureInput<Layer extends string, GlossaryName extends string = never> = {
  readonly projects: TypeScriptProjects;
  /** Named vocabularies; a layer's glossary setting picks the ones its names must follow. */
  readonly glossaries?: { readonly [K in GlossaryName]: GlossaryDefinition };
  readonly layers: { readonly [K in Layer]: LayerDefinition<NoInfer<Layer>, NoInfer<GlossaryName>> };
  /** Naming policy for every layer that does not set its own. */
  readonly naming?: NamingPolicy;
  /** Project-wide rule settings; a layer's rules override them. */
  readonly rules?: ProjectRules;
  /** How the baseline treats existing findings while the codebase is brought into line. */
  readonly adoption?: AdoptionSettings;
};
export type EffectiveRule = { readonly severity: Severity; readonly options: readonly unknown[]; readonly origin: string; readonly reason?: string };
export type EffectivePolicy = {
  readonly origins: { readonly naming: string; readonly dependencies: string };
  readonly naming?: NamingPolicy;
  readonly dependencies: Required<DependencyPolicy>;
  readonly rules: Readonly<Record<string, EffectiveRule>>;
  readonly generated?: GeneratedSetting;
  readonly entry?: EntrySetting;
  readonly development: boolean;
  /** The glossaries the layer's names follow, by name; none when the layer does not opt in. */
  readonly glossaries: readonly string[];
};
export type NormalizedLayer = LayerDefinition & { readonly policy: EffectivePolicy };
export type Adoption = {
  readonly mode: "enforce" | "observe";
  readonly onTouch: { readonly default: TouchPolicy; readonly rules: Readonly<Record<string, TouchPolicy>> };
};
/** A phrase as names spell it: its text as written, and its words. */
export type TermPhrase = { readonly text: string; readonly words: readonly string[] };
export type GlossaryTerm = {
  readonly name: string;
  readonly words: readonly string[];
  readonly definition: string;
  readonly avoid: readonly TermPhrase[];
  readonly type?: string;
};
export type Glossary = { readonly description?: string; readonly terms: readonly GlossaryTerm[] };
export type Architecture = {
  readonly projects: Required<TypeScriptProjects>;
  /** Every glossary, by name. */
  readonly glossaries: Readonly<Record<string, Glossary>>;
  readonly adoption: Adoption;
  /** The policy a layer inherits when it sets nothing itself. */
  readonly defaults: EffectivePolicy;
  readonly layers: Readonly<Record<string, NormalizedLayer>>;
};
