import type { EffectivePolicy, EffectiveRule } from "./types.js";
export declare const validateOptions: (id: string, options: readonly unknown[]) => void;
export declare const defaultRules: () => Record<string, EffectiveRule>;
export declare const overrideRules: (inherited: EffectivePolicy["rules"], input: unknown, origin: string, project: boolean) => Record<string, EffectiveRule>;
//# sourceMappingURL=normalizeRules.d.ts.map