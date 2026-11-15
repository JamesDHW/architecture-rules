import type { CheckResult } from "./checkResult.js";
import type { RuleGuidance } from "./ruleGuidance.js";
/** Findings grouped by file, a summary by rule, layer and stage, then how to fix each rule that fired. */
export declare const renderText: (result: CheckResult, guidance: readonly RuleGuidance[]) => string;
/** One JSON document: every finding, the guidance for the rules that reported them, and the summary. */
export declare const renderJson: (result: CheckResult, guidance: readonly RuleGuidance[]) => string;
//# sourceMappingURL=textOutput.d.ts.map