import type { Rule } from "eslint";
/** Which lines a count leaves out. */
export type LineCountOptions = {
    readonly skipBlankLines: boolean;
    readonly skipComments: boolean;
};
/** A 1-based, inclusive range of lines; the whole file when omitted. */
export type LineRange = {
    readonly start: number;
    readonly end: number;
};
/** Counts the lines of the file, or of a range of it, without the lines the options skip. */
export declare const countLines: (sourceCode: Rule.RuleContext["sourceCode"], options: LineCountOptions & {
    readonly range?: LineRange;
}) => number;
//# sourceMappingURL=lineCounting.d.ts.map