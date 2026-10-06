import { isAbsolute } from "node:path";
import picomatch from "picomatch";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
export const checked = (value, issues = []) => ({ value, issues });
/** Reads an optional field: absent stays undefined, present is checked. */
export const optional = (input, read) => {
    return input === undefined ? checked(undefined) : read(input);
};
export const fields = (input, allowed, label) => {
    if (!isRecord(input))
        return checked({}, [`${label} must be an object`]);
    const unknownKeys = Object.keys(input).filter((key) => !allowed.includes(key));
    return checked(input, unknownKeys.map((key) => `Unknown ${label} field: ${key}`));
};
const isNonemptyText = (input) => isString(input) && input.trim().length > 0;
export const text = (input, label) => {
    return isNonemptyText(input) ? checked(input) : checked("", [`${label} must be nonempty text`]);
};
export const strings = (input, label) => {
    if (!isUnknownArray(input))
        return checked([], [`${label} must be an array`]);
    const entries = input.map((entry) => text(entry, label));
    return checked(entries.map((entry) => entry.value), entries.flatMap((entry) => entry.issues));
};
const isRootRelative = (value) => {
    return !isAbsolute(value) && !value.startsWith("!") && !value.includes("\\") && !value.split("/").includes("..");
};
const hasGlobSyntax = (value) => /[*?{}[\]()!]/.test(value);
const patternIssues = (value, label, exact) => {
    if (!isRootRelative(value))
        return [`${label}: expected a root-relative positive path: ${value}`];
    const isGlobInExactPath = exact && hasGlobSyntax(value);
    if (isGlobInExactPath)
        return [`${label}: only exact paths are permitted: ${value}`];
    const compiled = tryCatch(() => picomatch(value));
    return compiled instanceof ArchitectureError ? [`${label}: invalid pattern ${value}: ${compiled.message}`] : [];
};
export const patterns = (input, label, exact = false) => {
    const values = strings(input, label);
    return checked(values.value, [...values.issues, ...values.value.flatMap((value) => patternIssues(value, label, exact))]);
};
const isObjectLike = (value) => typeof value === "object" && value !== null;
/** Deep-freezes a normalized configuration so later code cannot change it. */
export const freeze = (value) => {
    if (!isObjectLike(value))
        return value;
    for (const entry of Object.values(value)) {
        freeze(entry);
    }
    Object.freeze(value);
    return value;
};
//# sourceMappingURL=validation.js.map