import { ArchitectureError } from "./architectureError.js";
const describe = (caught) => caught instanceof Error ? caught.message : String(caught);
const toArchitectureError = (caught) => {
    if (caught instanceof ArchitectureError)
        return caught;
    return new ArchitectureError([describe(caught)], { cause: caught });
};
/** The error adapter: the only place that catches. Callers branch on the returned error. */
export const tryCatch = (operation) => {
    try {
        return operation();
    }
    catch (caught) {
        return toArchitectureError(caught);
    }
};
export const tryCatchAsync = async (operation) => {
    try {
        return await operation();
    }
    catch (caught) {
        return toArchitectureError(caught);
    }
};
/** Public API boundaries that must throw (defineArchitecture at config load) unwrap here. */
export const orThrow = (result) => {
    if (result instanceof ArchitectureError)
        throw result;
    return result;
};
//# sourceMappingURL=tryCatch.js.map