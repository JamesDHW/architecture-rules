import type { Architecture, DependencyPolicy, NamingPolicy } from "../config/types.js";
export type RuleOverride = {
    readonly rule: string;
    readonly severity: string;
    readonly reason?: string;
};
/** One external specifier pattern and the layers that list it. */
export type ExternalDependency = {
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
    readonly ruleOverrides: readonly RuleOverride[];
};
/** Everything describe prints, in the order the decisions are made. */
export type ArchitectureDescription = {
    readonly config: string;
    readonly projects: Architecture["projects"];
    readonly layers: readonly LayerDescription[];
    readonly external: readonly ExternalDependency[];
    readonly cycles: readonly (readonly string[])[];
    readonly naming?: NamingPolicy;
    readonly rules: {
        readonly on: number;
        readonly off: number;
        readonly overrides: readonly RuleOverride[];
    };
};
export declare const describeArchitecture: (architecture: Architecture, config: string) => ArchitectureDescription;
//# sourceMappingURL=architectureDescription.d.ts.map