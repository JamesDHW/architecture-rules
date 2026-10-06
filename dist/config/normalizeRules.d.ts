import type { EffectivePolicy } from "./types.js";
import { type Checked } from "./validation.js";
type EffectiveRules = EffectivePolicy["rules"];
/** Every problem with a rule's options; an empty list means they are valid. */
export declare const validateOptions: (id: string, options: readonly unknown[]) => readonly string[];
export declare const defaultRules: () => EffectiveRules;
/** Applies one rules map on top of inherited settings: severity-only changes keep options, explicit options replace them. */
export declare const overrideRules: (inherited: EffectiveRules, input: unknown, origin: string, project: boolean) => Checked<EffectiveRules>;
export {};
//# sourceMappingURL=normalizeRules.d.ts.map