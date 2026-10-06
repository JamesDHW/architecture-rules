import type { Rule } from "eslint";
import type { BodyStatement, IfStatement } from "./branchStatement.js";
type SourceCode = Rule.RuleContext["sourceCode"];
/** The first if of a run that a switch should replace, when the whole run qualifies. */
export declare const getSwitchCandidateHead: (nodes: readonly IfStatement[], sourceCode: SourceCode) => IfStatement | undefined;
/** An if followed by its else-if chain. */
export declare const collectChainIfs: (node: IfStatement) => readonly IfStatement[];
/** Maximal runs of two or more adjacent else-free ifs that compare the same discriminant. */
export declare const collectConsecutiveIfRuns: (statements: readonly BodyStatement[], sourceCode: SourceCode) => readonly (readonly IfStatement[])[];
export {};
//# sourceMappingURL=preferSwitchCandidates.d.ts.map