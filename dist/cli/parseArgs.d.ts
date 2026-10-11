export type DescribeFormat = "text" | "json" | "mermaid";
export type RunArgs = {
    readonly kind: "run";
    readonly target: string;
    readonly fix: boolean;
    readonly config?: string;
    readonly explain?: string;
    readonly describe?: DescribeFormat;
};
export type CliArgs = {
    readonly kind: "help";
} | {
    readonly kind: "error";
    readonly message: string;
} | RunArgs;
export declare const parseArgs: (argv: readonly string[]) => CliArgs;
//# sourceMappingURL=parseArgs.d.ts.map