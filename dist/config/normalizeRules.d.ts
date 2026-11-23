import type { EffectivePolicy } from "./types.js";
import { type Checked } from "./validation.js";
type EffectiveRules = EffectivePolicy["rules"];
/** Every problem with a rule's options; an empty list means they are valid. */
export declare const validateOptions: (id: string, options: readonly unknown[]) => readonly string[];
export declare const defaultRules: () => EffectiveRules;
/** Where a rules map is applied: what it inherits, the label its issues name, and whether it is the project's own. */
export type RulesScope = {
    readonly inherited: EffectiveRules;
    readonly origin: string;
    readonly project: boolean;
};
/** Applies one rules map on top of inherited settings: severity-only changes keep options, explicit options replace them. */
export declare const overrideRules: (scope: RulesScope, input: unknown) => Checked<EffectiveRules>;
export {};
//# sourceMappingURL=normalizeRules.d.ts.map