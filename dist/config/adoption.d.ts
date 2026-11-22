import type { Adoption, TouchPolicy } from "./types.js";
import { type Checked } from "./validation.js";
/** adoption: observe or enforce, and which rules a changed file must fix. Absent means enforce, and fix every rule but imports. */
export declare const adoption: (value: unknown) => Checked<Adoption>;
/** The touch policy of one rule: its own setting, otherwise the default. */
export declare const touchPolicyFor: (setting: Adoption, ruleId: string) => TouchPolicy;
//# sourceMappingURL=adoption.d.ts.map