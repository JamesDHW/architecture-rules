import type { Architecture, DependencyPolicy, EntrySetting, NamingPolicy } from "../config/types.js";
export type RuleOverride = {
    readonly rule: string;
    readonly severity: string;
    readonly reason?: string;
};
/** One external specifier pattern and the layers that list it. */
type ExternalDependency = {
    readonly specifier: string;
    readonly layers: readonly string[];
};
export type LayerDescription = {
    readonly name: string;
    readonly description: string;
    readonly files: readonly string[];
    readonly exclude: readonly string[];
    readonly dependencies: Required<DependencyPolicy>;
    /** Present when the layer sets its own naming policy. */
    readonly naming?: NamingPolicy;
    readonly generated?: string;
    readonly entry?: EntrySetting;
    readonly development: boolean;
    /** The glossaries the layer's names follow. */
    readonly glossaries: readonly string[];
    readonly ruleOverrides: readonly RuleOverride[];
};
/** One glossary: its terms as configured, and the layers that follow it. */
export type GlossaryDescription = {
    readonly name: string;
    readonly description?: string;
    readonly layers: readonly string[];
    readonly terms: readonly {
        readonly name: string;
        readonly definition: string;
        readonly avoid: readonly string[];
        readonly type?: string;
    }[];
};
/** Everything describe prints, in the order the decisions are made. */
export type ArchitectureDescription = {
    readonly config: string;
    readonly projects: Architecture["projects"];
    readonly layers: readonly LayerDescription[];
    readonly external: readonly ExternalDependency[];
    readonly cycles: readonly (readonly string[])[];
    readonly glossaries: readonly GlossaryDescription[];
    readonly naming?: NamingPolicy;
    readonly rules: {
        readonly on: number;
        readonly off: number;
        readonly overrides: readonly RuleOverride[];
    };
};
export declare const describeArchitecture: (architecture: Architecture, config: string) => ArchitectureDescription;
export {};
//# sourceMappingURL=architectureDescription.d.ts.map