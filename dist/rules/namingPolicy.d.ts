export type NamingPolicy = {
    readonly case: "camel" | "pascal" | "pascalOrCamel";
    readonly prefix?: string;
    /** Explicit stem suffixes, e.g. .test, .constants. Longest match wins. */
    readonly suffixes?: readonly string[];
    /** Exact filenames, e.g. page.tsx. Exempts naming only. */
    readonly allowedNames?: readonly string[];
};
export declare const isNamingCase: (value: unknown) => value is NamingPolicy["case"];
export declare const hasValidCase: (stem: string, namingCase: NamingPolicy["case"]) => boolean;
/** The longest listed suffix that name ends with; the first listed wins a tie. */
export declare const longestMatchingSuffix: (name: string, suffixes: readonly string[]) => string | undefined;
/** Structural counterpart of namingSchema, for options that arrive untyped. */
export declare const isNamingPolicy: (value: unknown) => value is NamingPolicy;
export declare const namingError: (path: string, policy: NamingPolicy) => string | undefined;
export declare const namingSchema: {
    type: string;
    properties: {
        case: {
            enum: string[];
        };
        prefix: {
            type: string;
            minLength: number;
        };
        suffixes: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
        };
        allowedNames: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
        };
    };
    required: string[];
    additionalProperties: boolean;
};
//# sourceMappingURL=namingPolicy.d.ts.map