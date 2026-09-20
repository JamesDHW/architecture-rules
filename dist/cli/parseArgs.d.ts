export type CliArgs = {
    readonly kind: "help";
} | {
    readonly kind: "error";
    readonly message: string;
} | {
    readonly kind: "run";
    readonly target: string;
    readonly fix: boolean;
    readonly config?: string;
    readonly explain?: string;
};
export declare const parseArgs: (argv: readonly string[]) => CliArgs;
//# sourceMappingURL=parseArgs.d.ts.map