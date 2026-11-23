/** A JSON-compatible rule option, as RuleTester accepts it. */
export type CaseOption = string | number | boolean | null | CaseOption[] | {
    readonly [key: string]: CaseOption;
};
type FindingPosition = {
    readonly line?: number;
    readonly column?: number;
    readonly endLine?: number;
    readonly endColumn?: number;
};
type ByMessageId = {
    readonly messageId: string;
    readonly data?: Readonly<Record<string, string>>;
};
type ByMessage = {
    readonly message: string;
};
/** A finding a test case expects, matched by message id or by its exact text. */
export type ExpectedFinding = FindingPosition & (ByMessageId | ByMessage);
type CaseInput = {
    readonly name?: string;
    readonly code: string;
    readonly filename?: string;
    readonly options?: readonly CaseOption[];
};
export type ValidCase = string | CaseInput;
export type InvalidCase = CaseInput & {
    readonly errors: readonly ExpectedFinding[];
};
/** One set of a rule's test cases. The test suite runs them and the rule's generated documentation shows them. */
export type RuleCases = {
    readonly lang?: "ts" | "tsx";
    readonly valid: readonly ValidCase[];
    readonly invalid: readonly InvalidCase[];
};
/** An expected finding by message id, with the values of its {{name}} placeholders. */
export declare const expectedFinding: (messageId: string, placeholders: Readonly<Record<string, string>>) => ExpectedFinding;
export {};
//# sourceMappingURL=ruleCases.d.ts.map