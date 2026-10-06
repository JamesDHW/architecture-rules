export type OutputFormat = "json" | "report";
export type RunArgs = {
    readonly kind: "run";
    readonly target: string;
    readonly fix: boolean;
    readonly config?: string;
    readonly explain?: string;
    /** Omitted for the default text output. */
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
//# sourceMappingURL=parseArgs.d.ts.map