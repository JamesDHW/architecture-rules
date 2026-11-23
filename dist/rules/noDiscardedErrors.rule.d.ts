export declare const noDiscardedErrorsRule: {
    readonly id: "no-discarded-errors";
    readonly title: "Do not turn errors into empty values";
    readonly description: string;
    readonly instead: "Return or pass on the error, or log it before returning the empty value.";
    readonly suppressWhen: "The empty value is the documented meaning of this failure, for example an optional enrichment that may be missing.";
    readonly enforcement: {
        readonly type: "program";
        readonly configuration: "error";
    };
};
//# sourceMappingURL=noDiscardedErrors.rule.d.ts.map