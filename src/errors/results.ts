import { ArchitectureError, isArchitectureError } from "./architectureError.js";

/** Every value, or one error carrying the issues of every failure. */
export const allOrError = <Value>(results: readonly (Value | ArchitectureError)[]): readonly Value[] | ArchitectureError => {
  const failures = results.filter(isArchitectureError);
  if (failures.length > 0) return new ArchitectureError(failures.flatMap((failure) => failure.issues));
  return results.filter((result): result is Value => !isArchitectureError(result));
};

/** The operation's outcome after cleanup ran: a cleanup failure is never discarded, and both failures are kept. */
export const afterCleanup = <Value>(outcome: Value | ArchitectureError, cleanup: unknown): Value | ArchitectureError => {
  if (!isArchitectureError(cleanup)) return outcome;
  if (!isArchitectureError(outcome)) return cleanup;
  return new ArchitectureError([...outcome.issues, ...cleanup.issues], { cause: outcome });
};
