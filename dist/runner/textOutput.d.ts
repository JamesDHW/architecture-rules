import type { Finding } from "./findings.js";
import type { RuleGuidance } from "./ruleGuidance.js";
/** Lint findings and the fix guidance go to stdout; structural and compiler findings to stderr. */
export declare const printText: (findings: readonly Finding[], guidance: readonly RuleGuidance[]) => void;
/** One JSON document with every finding and the guidance for the rules that reported them. */
export declare const printJson: (findings: readonly Finding[], guidance: readonly RuleGuidance[]) => void;
//# sourceMappingURL=textOutput.d.ts.map