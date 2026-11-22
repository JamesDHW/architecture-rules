import type { ChangeSource } from "../baseline/changedSet.js";
/** Every flag the CLI accepts, before the command decides which of them apply. */
export type Options = {
    readonly positionals: readonly string[];
    readonly fix: boolean;
    readonly config?: string;
    /** --json or --mermaid. */
    readonly format?: "json" | "mermaid";
    /** --format's value, checked by the command. */
    readonly formatName?: string;
    readonly files: readonly string[];
    readonly change?: ChangeSource;
    readonly ci: boolean;
    readonly summary?: string;
    readonly fixableIn?: number;
    readonly incoming: boolean;
    readonly layer?: string;
    readonly rules: readonly string[];
    readonly reason?: string;
    readonly accept: boolean;
    readonly paths: readonly string[];
    readonly prompt: boolean;
    readonly agentSnippet: boolean;
};
export type ParseError = {
    readonly kind: "error";
    readonly message: string;
};
export declare const failure: (message: string) => ParseError;
export declare const initialOptions: Options;
export declare const configOption: ({ config }: Options) => {
    readonly config?: string;
};
/** Flags that only a check uses; any other command rejects them. */
export declare const hasCheckOnlyOptions: (options: Options) => boolean;
/** Flags that only baseline, fix, graph and adopt use. */
export declare const hasCommandOnlyOptions: (options: Options) => boolean;
export declare const hasOnlyProjectOptions: (options: Options) => boolean;
/** Reads every flag and positional argument; which apply is the command's decision. */
export declare const parseOptions: (argv: readonly string[], options: Options) => Options | ParseError;
//# sourceMappingURL=parseOptions.d.ts.map