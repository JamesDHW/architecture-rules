/**
 * A normalized value plus every problem found while producing it. Invalid input
 * yields a neutral fallback value, so validation can continue and report every
 * problem in one pass instead of stopping at the first.
 */
export type Checked<Value> = {
    readonly value: Value;
    readonly issues: readonly string[];
};
export declare const checked: <Value>(value: Value, issues?: readonly string[]) => Checked<Value>;
/** Reads an optional field: absent stays undefined, present is checked. */
export declare const optional: <Value>(input: unknown, read: (value: unknown) => Checked<Value>) => Checked<Value | undefined>;
export declare const fields: (input: unknown, allowed: readonly string[], label: string) => Checked<Readonly<Record<string, unknown>>>;
export declare const text: (input: unknown, label: string) => Checked<string>;
export declare const strings: (input: unknown, label: string) => Checked<readonly string[]>;
export declare const patterns: (input: unknown, label: string, exact?: boolean) => Checked<readonly string[]>;
/** Deep-freezes a normalized configuration so later code cannot change it. */
export declare const freeze: <Value>(value: Value) => Value;
//# sourceMappingURL=validation.d.ts.map