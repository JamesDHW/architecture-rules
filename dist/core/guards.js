/** Shared structural type guards. Validate unknown input with these instead of asserting its type. */
export const isRecord = (value) => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};
/** Array.isArray narrows unknown to any[]; this keeps the elements unknown so they must be checked. */
export const isUnknownArray = (value) => Array.isArray(value);
export const isString = (value) => typeof value === "string";
export const isStringArray = (value) => isUnknownArray(value) && value.every(isString);
export const isPresent = (value) => value !== null && value !== undefined;
//# sourceMappingURL=guards.js.map