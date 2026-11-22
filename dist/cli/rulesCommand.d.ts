import type { ArchitectureRule } from "../core/defineRule.js";
/** architecture-check rules: every rule's id, kind and title, or the whole catalogue as JSON. */
export declare const rulesCommand: (json: boolean) => number;
/** architecture-check explain <rule>: what the rule checks, why, how to fix its findings, and when to except one. */
export declare const explainRule: (rule: ArchitectureRule) => number;
//# sourceMappingURL=rulesCommand.d.ts.map