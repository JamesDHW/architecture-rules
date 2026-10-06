import { ArchitectureError } from "./architectureError.js";
/** The error adapter: the only place that catches. Callers branch on the returned error. */
export declare const tryCatch: <Value>(operation: () => Value) => Value | ArchitectureError;
export declare const tryCatchAsync: <Value>(operation: () => Promise<Value>) => Promise<Value | ArchitectureError>;
/** Public API boundaries that must throw (defineArchitecture at config load) unwrap here. */
export declare const orThrow: <Value>(result: Value | ArchitectureError) => Value;
//# sourceMappingURL=tryCatch.d.ts.map