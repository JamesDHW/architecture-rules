import type { OxlintConfig } from "oxlint";
import type { Severity } from "../core/defineRule.js";
import type { rules } from "../rules/index.js";
import type { RuleOptions } from "../core/defineRule.js";

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

export type NamingPolicy = {
  readonly case: "camel" | "pascal" | "pascalOrCamel";
  readonly prefix?: string;
  /** Explicit stem suffixes, e.g. .test, .constants. Longest match wins. */
  readonly suffixes?: readonly string[];
  /** Exact filenames, e.g. page.tsx. Exempts naming only. */
  readonly allowedNames?: readonly string[];
};
export type ImportPolicy<Name extends string = string> = {
  readonly internal?: readonly Name[];
  readonly external?: readonly string[];
  readonly builtins?: readonly string[];
  readonly assets?: readonly string[];
};
export type Policy<Name extends string = string> = {
  readonly naming?: NamingPolicy;
  readonly imports?: ImportPolicy<Name>;
  readonly rules?: FileRules;
};
export type FileType<Name extends string = string> = Policy<Name> & {
  readonly description: string;
  readonly files: readonly string[];
  readonly exclude?: readonly string[];
};
export type ArchitectureInput<Name extends string> = {
  readonly projects: { readonly tsconfigs: readonly string[]; readonly references?: "follow" | "explicit" };
  readonly files?: {
    readonly otherFiles?: readonly string[];
    /** Exact paths only, outside application programs; not a source glob exemption. */
    readonly toolingFiles?: readonly string[];
    readonly generated?: readonly { readonly files: readonly string[]; readonly reason: string }[];
  };
  readonly defaults?: Omit<Policy<NoInfer<Name>>, "rules"> & { readonly rules?: ProjectRules };
  readonly fileTypes: { readonly [K in Name]: FileType<NoInfer<Name>> };
};
export type EffectiveRule = { readonly severity: Severity; readonly options: readonly unknown[]; readonly origin: string; readonly reason?: string };
export type EffectivePolicy = {
  readonly origins: { readonly naming: string; readonly imports: string };
  readonly naming?: NamingPolicy;
  readonly imports: Required<ImportPolicy>;
  readonly rules: Readonly<Record<string, EffectiveRule>>;
};
export type Architecture = {
  readonly projects: ArchitectureInput<string>["projects"];
  readonly files: Required<NonNullable<ArchitectureInput<string>["files"]>>;
  readonly defaults: EffectivePolicy;
  readonly fileTypes: Readonly<Record<string, FileType & { readonly policy: EffectivePolicy }>>;
};
