import { ArchitectureError } from "./architectureError.js";

const describe = (caught: unknown): string => caught instanceof Error ? caught.message : String(caught);

const toArchitectureError = (caught: unknown): ArchitectureError => {
  if (caught instanceof ArchitectureError) return caught;
  return new ArchitectureError([describe(caught)], { cause: caught });
};

/** The error adapter: the only place that catches. Callers branch on the returned error. */
export const tryCatch = <Value>(operation: () => Value): Value | ArchitectureError => {
  try {
    return operation();
  } catch (caught) {
    return toArchitectureError(caught);
  }
};

export const tryCatchAsync = async <Value>(operation: () => Promise<Value>): Promise<Value | ArchitectureError> => {
  try {
    return await operation();
  } catch (caught) {
    return toArchitectureError(caught);
  }
};

/** Public API boundaries that must throw (defineArchitecture at config load) unwrap here. */
export const orThrow = <Value>(result: Value | ArchitectureError): Value => {
  if (result instanceof ArchitectureError) throw result;
  return result;
};
