import { ArchitectureError, isArchitectureError } from "./architectureError.js";
/** Every value, or one error carrying the issues of every failure. */
export const allOrError = (results) => {
    const failures = results.filter(isArchitectureError);
    if (failures.length > 0)
        return new ArchitectureError(failures.flatMap((failure) => failure.issues));
    return results.filter((result) => !isArchitectureError(result));
};
/** The operation's outcome after cleanup ran: a cleanup failure is never discarded, and both failures are kept. */
export const afterCleanup = (outcome, cleanup) => {
    if (!isArchitectureError(cleanup))
        return outcome;
    if (!isArchitectureError(outcome))
        return cleanup;
    return new ArchitectureError([...outcome.issues, ...cleanup.issues], { cause: outcome });
};
//# sourceMappingURL=results.js.map