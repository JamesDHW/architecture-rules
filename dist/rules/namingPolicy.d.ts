export declare const namingCases: readonly ["camelCase", "PascalCase", "kebab-case", "snake_case"];
export type NamingCase = (typeof namingCases)[number];
/**
 * A filename reads <stem><suffixes>.<extension>, e.g. useProject.controller.test.ts.
 * The stem must use one of the cases and, when a prefix is set, start with one of them.
 */
export type NamingPolicy = {
    readonly case: NamingCase | readonly NamingCase[];
    readonly prefix?: string | readonly string[];
    /** Optional suffixes; any of them may stack, in any order: noLet.rule.test.ts. */
    readonly suffixes?: readonly string[];
    /** Every file must carry at least one of these suffixes. */
    readonly requiredSuffix?: string | readonly string[];
    /** Exact filenames, e.g. page.tsx. Exempts naming only. */
    readonly allowedNames?: readonly string[];
};
export declare const isNamingCase: (value: unknown) => value is NamingCase;
/** One case or a nonempty list of cases. */
export declare const isNamingCaseSetting: (value: unknown) => value is NamingPolicy["case"];
/** A single value or a list of them, as a list. */
export declare const asList: <Value extends string>(value: Value | readonly Value[] | undefined) => readonly Value[];
/** Why a filename breaks the policy, or undefined when it complies. */
export declare const namingError: (path: string, policy: NamingPolicy) => string | undefined;
/** Structural counterpart of namingSchema, for options that arrive untyped. */
export declare const isNamingPolicy: (value: unknown) => value is NamingPolicy;
export declare const namingSchema: {
    type: string;
    properties: {
        case: {
            anyOf: ({
                enum: readonly ["camelCase", "PascalCase", "kebab-case", "snake_case"];
                type?: never;
                items?: never;
                minItems?: never;
            } | {
                enum?: never;
                type: string;
                items: {
                    enum: readonly ["camelCase", "PascalCase", "kebab-case", "snake_case"];
                };
                minItems: number;
            })[];
        };
        prefix: {
            anyOf: ({
                type: string;
                minLength: number;
            } | {
                type: string;
                items: {
                    type: string;
                    minLength: number;
                };
                minLength?: never;
                minItems: number;
            })[];
        };
        suffixes: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
        };
        requiredSuffix: {
            anyOf: ({
                type: string;
                minLength: number;
            } | {
                type: string;
                items: {
                    type: string;
                    minLength: number;
                };
                minLength?: never;
                minItems: number;
            })[];
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