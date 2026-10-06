/** Every failure this package returns as a value carries the problems it found. */
export declare class ArchitectureError extends Error {
    readonly issues: readonly string[];
    constructor(issues: readonly string[], options?: ErrorOptions);
}
export declare const isArchitectureError: (value: unknown) => value is ArchitectureError;
//# sourceMappingURL=architectureError.d.ts.map