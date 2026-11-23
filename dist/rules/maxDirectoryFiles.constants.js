export const DIRECTORY_WARN_OPTIONS = { max: 15 };
export const DIRECTORY_ERROR_OPTIONS = { max: 30 };
/** What both directory rules tell a reader to do, and when to set a layer's limit instead. */
export const DIRECTORY_GUIDANCE = {
    instead: "Move files that share a concept into a subfolder named after it.",
    suppressWhen: "A line comment cannot cover a directory. When a flat folder is the framework's contract, set the layer's limit with a reason.",
};
//# sourceMappingURL=maxDirectoryFiles.constants.js.map