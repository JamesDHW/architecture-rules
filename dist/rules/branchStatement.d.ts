import type { Rule } from "eslint";
/** A statement as ESLint's ESTree types describe it, such as the branch of an if statement. */
export type Statement = Parameters<NonNullable<Rule.RuleListener["IfStatement"]>>[0]["consequent"];
/** An entry of a program, block or switch-case body; a program body also holds module declarations. */
export type BodyStatement = Parameters<NonNullable<Rule.RuleListener["Program"]>>[0]["body"][number];
export type IfStatement = Extract<Statement, {
    readonly type: "IfStatement";
}>;
/** The only statement of a branch: the branch itself, or the sole statement of its block. */
export declare const getSoleStatement: (branch: Statement) => Statement | undefined;
//# sourceMappingURL=branchStatement.d.ts.map