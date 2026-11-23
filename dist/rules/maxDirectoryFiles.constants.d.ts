export type MaxDirectoryFilesOptions = {
    readonly max: number;
};
export declare const DIRECTORY_WARN_OPTIONS: {
    readonly max: 15;
};
export declare const DIRECTORY_ERROR_OPTIONS: {
    readonly max: 30;
};
/** What both directory rules tell a reader to do, and when to set a layer's limit instead. */
export declare const DIRECTORY_GUIDANCE: {
    readonly instead: "Move files that share a concept into a subfolder named after it.";
    readonly suppressWhen: "A line comment cannot cover a directory. When a flat folder is the framework's contract, set the layer's limit with a reason.";
};
//# sourceMappingURL=maxDirectoryFiles.constants.d.ts.map