import type { CheckResult } from "./checkResult.js";
import type { RuleGuidance } from "./ruleGuidance.js";
/**
 * Findings grouped by file, a summary by rule, layer and stage, then how to fix each rule that fired. Recorded debt
 * in untouched files is counted, not listed; notes (what the baseline did) come last.
 */
export declare const renderText: (result: CheckResult, guidance: readonly RuleGuidance[], notes?: readonly string[]) => string;
/** One JSON document: every finding with its status, the guidance for the rules that reported them, and the summary. */
export declare const renderJson: (result: CheckResult, guidance: readonly RuleGuidance[], extra?: Readonly<Record<string, unknown>>) => string;
/**
 * For agent hooks: only what must change, one line per finding, then one line per rule on what to write instead.
 * Nothing at all when the files are clean, so a passing hook adds nothing to the agent's context.
 */
export declare const renderAgent: (result: CheckResult, guidance: readonly RuleGuidance[], notes?: readonly string[]) => string;
//# sourceMappingURL=textOutput.d.ts.map