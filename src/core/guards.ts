/** Shared structural type guards. Validate unknown input with these instead of asserting its type. */

export const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

/** Array.isArray narrows unknown to any[]; this keeps the elements unknown so they must be checked. */
export const isUnknownArray = (value: unknown): value is readonly unknown[] => Array.isArray(value);

export const isString = (value: unknown): value is string => typeof value === "string";

export const isStringArray = (value: unknown): value is readonly string[] => isUnknownArray(value) && value.every(isString);

export const isPresent = <Value>(value: Value | null | undefined): value is Value => value !== null && value !== undefined;
