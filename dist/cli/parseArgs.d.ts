export type DescribeFormat = "text" | "json" | "mermaid";
/** How a check prints its findings; omitted on RunArgs for the default text output. */
type OutputFormat = "json" | "report";
export type RunArgs = {
    readonly kind: "run";
    readonly target: string;
    readonly fix: boolean;
    readonly config?: string;
    readonly explain?: string;
    readonly describe?: DescribeFormat;
    readonly format?: OutputFormat;
    /** Lint and report only these files; the whole project is still analyzed. */
    readonly files?: readonly string[];
};
export type CliArgs = {
    readonly kind: "help";
} | {
    readonly kind: "error";
    readonly message: string;
} | RunArgs;
export declare const parseArgs: (argv: readonly string[]) => CliArgs;
export {};
//# sourceMappingURL=parseArgs.d.ts.map