import { basename } from "node:path";
import { isRecord, isString, isStringArray } from "../core/guards.js";
export const namingCases = ["camelCase", "PascalCase", "kebab-case", "snake_case"];
const casePatterns = {
    camelCase: /^[a-z][A-Za-z0-9]*$/,
    PascalCase: /^[A-Z][A-Za-z0-9]*$/,
    "kebab-case": /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
    snake_case: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/,
};
export const isNamingCase = (value) => namingCases.some((namingCase) => namingCase === value);
const isNamingCaseList = (value) => isStringArray(value) && value.length > 0 && value.every(isNamingCase);
/** One case or a nonempty list of cases. */
export const isNamingCaseSetting = (value) => isNamingCase(value) || isNamingCaseList(value);
/** A single value or a list of them, as a list. */
export const asList = (value) => {
    if (value === undefined)
        return [];
    return typeof value === "string" ? [value] : value;
};
/** Removes known suffixes from the end of name, longest first and each at most once. */
const splitSuffixes = (name, known) => {
    const matching = known.filter((suffix) => name.length > suffix.length && name.endsWith(suffix));
    const longest = matching.toSorted((left, right) => right.length - left.length).at(0);
    if (longest === undefined)
        return { stem: name, suffixes: [] };
    const rest = splitSuffixes(name.slice(0, -longest.length), known.filter((suffix) => suffix !== longest));
    return { stem: rest.stem, suffixes: [...rest.suffixes, longest] };
};
const describeChoices = (choices) => choices.map((choice) => `'${choice}'`).join(" or ");
/** Why a filename breaks the policy, or undefined when it complies. */
export const namingError = (path, policy) => {
    const name = basename(path);
    if (policy.allowedNames?.includes(name) === true)
        return undefined;
    const required = asList(policy.requiredSuffix);
    const { stem, suffixes } = splitSuffixes(name.replace(/(?:\.d)?\.[cm]?[jt]sx?$/i, ""), [...required, ...(policy.suffixes ?? [])]);
    const hasRequiredSuffix = required.length === 0 || suffixes.some((suffix) => required.includes(suffix));
    if (!hasRequiredSuffix)
        return `Filename '${name}' must end with ${describeChoices(required)} before its extension.`;
    const cases = asList(policy.case);
    const suffixNote = suffixes.length === 0 ? "" : ` before ${suffixes.join("")}`;
    if (!cases.some((namingCase) => casePatterns[namingCase].test(stem)))
        return `Filename '${name}' must use ${cases.join(" or ")}${suffixNote}.`;
    const prefixes = asList(policy.prefix);
    const hasPrefix = prefixes.length === 0 || prefixes.some((prefix) => stem.startsWith(prefix));
    return hasPrefix ? undefined : `Filename '${name}' must start with ${describeChoices(prefixes)}.`;
};
const isAbsentOr = (value, guard) => value === undefined || guard(value);
const isTextOrTextList = (value) => isString(value) || isStringArray(value);
/** Structural counterpart of namingSchema, for options that arrive untyped. */
export const isNamingPolicy = (value) => {
    return isRecord(value)
        && isNamingCaseSetting(value.case)
        && isAbsentOr(value.prefix, isTextOrTextList)
        && isAbsentOr(value.suffixes, isStringArray)
        && isAbsentOr(value.requiredSuffix, isTextOrTextList)
        && isAbsentOr(value.allowedNames, isStringArray);
};
const textList = { type: "array", items: { type: "string", minLength: 1 } };
const textOrTextList = { anyOf: [{ type: "string", minLength: 1 }, { ...textList, minItems: 1 }] };
export const namingSchema = {
    type: "object",
    properties: {
        case: { anyOf: [{ enum: namingCases }, { type: "array", items: { enum: namingCases }, minItems: 1 }] },
        prefix: textOrTextList,
        suffixes: textList,
        requiredSuffix: textOrTextList,
        allowedNames: textList,
    },
    required: ["case"], additionalProperties: false,
};
//# sourceMappingURL=namingPolicy.js.map