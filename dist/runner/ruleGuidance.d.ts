import type { Finding } from "./findings.js";
/** What to write instead of a rule's findings, and where its documentation page is. */
export type RuleGuidance = {
    readonly ruleId: string;
    readonly instead?: string;
    readonly docs: string;
};
/** Guidance for each rule that reported a finding, in first-seen order. */
export declare const guidanceFor: (root: string, findings: readonly Finding[]) => readonly RuleGuidance[];
//# sourceMappingURL=ruleGuidance.d.ts.map