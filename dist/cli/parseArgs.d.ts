export type CliArgs = {
    readonly kind: "help";
} | {
    readonly kind: "error";
    readonly message: string;
} | {
    readonly kind: "run";
    readonly target: string;
    readonly fix: boolean;
};
export declare const parseArgs: (argv: readonly string[]) => CliArgs;
//# sourceMappingURL=parseArgs.d.ts.map