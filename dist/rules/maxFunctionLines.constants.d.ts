export type MaxFunctionLinesOptions = {
    readonly max: number;
    readonly skipBlankLines: boolean;
    readonly skipComments: boolean;
};
export declare const FUNCTION_WARN_OPTIONS: {
    readonly max: 40;
    readonly skipBlankLines: true;
    readonly skipComments: true;
};
export declare const FUNCTION_ERROR_OPTIONS: {
    readonly max: 80;
    readonly skipBlankLines: true;
    readonly skipComments: true;
    readonly IIFEs: false;
};
//# sourceMappingURL=maxFunctionLines.constants.d.ts.map