import { ArchitectureError } from "./architectureError.js";
/** Every value, or one error carrying the issues of every failure. */
export declare const allOrError: <Value>(results: readonly (Value | ArchitectureError)[]) => readonly Value[] | ArchitectureError;
/** The operation's outcome after cleanup ran: a cleanup failure is never discarded, and both failures are kept. */
export declare const afterCleanup: <Value>(outcome: Value | ArchitectureError, cleanup: unknown) => Value | ArchitectureError;
//# sourceMappingURL=results.d.ts.map