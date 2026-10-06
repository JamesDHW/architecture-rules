import type { OxlintConfig } from "oxlint";
import type { OxlintRuleConfiguration, RuleEvasion, Severity } from "../core/defineRule.js";
type NativeMap = NonNullable<OxlintConfig["rules"]>;
type KnownNativeMap = {
    [K in keyof NativeMap as string extends K ? never : number extends K ? never : K]: NativeMap[K];
};
type Tail<T> = T extends readonly [unknown, ...infer Options] ? Options : never;
type ReadonlyOptions<T> = T extends readonly unknown[] ? {
    readonly [K in keyof T]: ReadonlyOptions<T[K]>;
} : T extends object ? {
    readonly [K in keyof T]: ReadonlyOptions<T[K]>;
} : T;
type Configuration<N extends keyof KnownNativeMap> = Severity | readonly [Severity, ...ReadonlyOptions<Tail<KnownNativeMap[N]>>];
type NativeConfiguration<N extends keyof KnownNativeMap> = Configuration<NoInfer<N>> & OxlintRuleConfiguration;
type RuleGuidance = {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly RuleEvasion[];
};
type NativeOxlintRule<Id extends string, Native extends keyof KnownNativeMap> = RuleGuidance & {
    readonly id: Id;
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: Native;
        readonly configuration: NativeConfiguration<Native>;
    };
};
export declare const defineNativeOxlintRule: <const Id extends string, const Native extends keyof KnownNativeMap>(rule: RuleGuidance & {
    readonly id: Id;
    readonly title: string;
    readonly description: string;
    readonly rule: Native;
    readonly configuration: NativeConfiguration<Native>;
}) => NativeOxlintRule<Id, Native>;
export {};
//# sourceMappingURL=defineNativeOxlintRule.d.ts.map