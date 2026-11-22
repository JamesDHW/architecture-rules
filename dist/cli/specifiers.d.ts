/** A quoted string literal in source text, with where its text starts. */
export type Literal = {
    readonly value: string;
    readonly start: number;
};
/** Every single-, double- or backtick-quoted string without interpolation or a line break. */
export declare const literals: (text: string) => readonly Literal[];
/** The existing file a relative specifier resolves to from the importing file, or undefined. */
export declare const resolveRelative: (importer: string, specifier: string) => string | undefined;
/** A replacement of part of a file's text. */
export type TextEdit = {
    readonly start: number;
    readonly end: number;
    readonly replacement: string;
};
/** Applies non-overlapping edits from the end, so earlier offsets stay valid. */
export declare const applyTextEdits: (text: string, edits: readonly TextEdit[]) => string;
//# sourceMappingURL=specifiers.d.ts.map