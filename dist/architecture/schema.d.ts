export type JsonSchema = boolean | {
    readonly [key: string]: unknown;
};
export declare const object: (value: unknown) => value is Record<string, unknown>;
export declare const getNativeSchema: () => Record<string, unknown>;
/** Small interpreter for the JSON Schema vocabulary used by the pinned Oxlint schemas. */
export declare const matchesSchema: (value: unknown, schema: unknown, root?: unknown) => boolean;
//# sourceMappingURL=schema.d.ts.map