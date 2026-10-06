/** Shared structural type guards. Validate unknown input with these instead of asserting its type. */
export declare const isRecord: (value: unknown) => value is Readonly<Record<string, unknown>>;
/** Array.isArray narrows unknown to any[]; this keeps the elements unknown so they must be checked. */
export declare const isUnknownArray: (value: unknown) => value is readonly unknown[];
export declare const isString: (value: unknown) => value is string;
export declare const isStringArray: (value: unknown) => value is readonly string[];
export declare const isPresent: <Value>(value: Value | null | undefined) => value is Value;
//# sourceMappingURL=guards.d.ts.map