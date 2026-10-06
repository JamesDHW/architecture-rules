import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { UNSIGNED_FORMAT_MAXIMUM } from "./configuration.constants.js";
const resolvePath = (target, keys) => {
    const [key, ...rest] = keys;
    if (key === undefined)
        return target;
    return resolvePath(isRecord(target) ? target[key] : undefined, rest);
};
const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const matchesTypeName = (value, type) => {
    switch (type) {
        case "object":
            return isRecord(value);
        case "array":
            return isUnknownArray(value);
        case "null":
            return value === null;
        case "integer":
            return Number.isInteger(value);
        default:
            return typeof value === type;
    }
};
const isWithinLength = (length, minimum, maximum) => {
    const isTooShort = typeof minimum === "number" && length < minimum;
    const isTooLong = typeof maximum === "number" && length > maximum;
    return !isTooShort && !isTooLong;
};
const isUnsignedFormat = (format) => isString(format) && format.startsWith("uint");
const matchesUnsignedFormat = (value, format) => {
    if (!isUnsignedFormat(format))
        return true;
    const maximum = UNSIGNED_FORMAT_MAXIMUM[format] ?? Number.POSITIVE_INFINITY;
    return Number.isInteger(value) && value >= 0 && value <= maximum;
};
const matchesPattern = (value, pattern) => {
    if (!isString(pattern))
        return true;
    return new RegExp(pattern).test(value);
};
const hasUniqueEntries = (entries) => {
    const serialized = new Set(entries.map((entry) => JSON.stringify(entry)));
    return serialized.size === entries.length;
};
const matchesReference = (value, schema, root) => {
    if (!isString(schema.$ref))
        return true;
    return matchesSchema(value, resolvePath(root, schema.$ref.replace(/^#\//, "").split("/")), root);
};
const matchesAllOf = (value, schema, root) => {
    return !isUnknownArray(schema.allOf) || schema.allOf.every((variant) => matchesSchema(value, variant, root));
};
const matchesAnyOf = (value, schema, root) => {
    return !isUnknownArray(schema.anyOf) || schema.anyOf.some((variant) => matchesSchema(value, variant, root));
};
const matchesOneOf = (value, schema, root) => {
    return !isUnknownArray(schema.oneOf) || schema.oneOf.filter((variant) => matchesSchema(value, variant, root)).length === 1;
};
const matchesConst = (value, schema) => !("const" in schema) || sameJson(value, schema.const);
const matchesEnum = (value, schema) => {
    return !isUnknownArray(schema.enum) || schema.enum.some((option) => sameJson(option, value));
};
const matchesType = (value, schema) => {
    if (schema.type === undefined)
        return true;
    const types = isUnknownArray(schema.type) ? schema.type : [schema.type];
    return types.some((type) => matchesTypeName(value, type));
};
const matchesNumber = (value, schema) => {
    if (typeof value !== "number")
        return true;
    const isBelowMinimum = typeof schema.minimum === "number" && value < schema.minimum;
    const isAboveMaximum = typeof schema.maximum === "number" && value > schema.maximum;
    return !isBelowMinimum && !isAboveMaximum && matchesUnsignedFormat(value, schema.format);
};
const matchesString = (value, schema) => {
    if (!isString(value))
        return true;
    return isWithinLength(value.length, schema.minLength, schema.maxLength) && matchesPattern(value, schema.pattern);
};
const matchesTupleEntries = (entries, items, schema, root) => {
    const allowsExtraEntries = schema.additionalItems !== false;
    const fitsTuple = allowsExtraEntries || entries.length <= items.length;
    return fitsTuple && entries.every((entry, index) => index >= items.length || matchesSchema(entry, items.at(index), root));
};
const matchesEntries = (entries, schema, root) => {
    const { items } = schema;
    if (isUnknownArray(items))
        return matchesTupleEntries(entries, items, schema, root);
    return items === undefined || entries.every((entry) => matchesSchema(entry, items, root));
};
const matchesArray = (value, schema, root) => {
    if (!isUnknownArray(value))
        return true;
    const isDuplicated = schema.uniqueItems === true && !hasUniqueEntries(value);
    return !isDuplicated && isWithinLength(value.length, schema.minItems, schema.maxItems) && matchesEntries(value, schema, root);
};
const hasRequiredKeys = (value, required) => {
    return !isUnknownArray(required) || required.every((key) => isString(key) && key in value);
};
const matchesProperty = (entry, key, schema, root) => {
    const properties = isRecord(schema.properties) ? schema.properties : {};
    if (key in properties)
        return matchesSchema(entry, properties[key], root);
    if (schema.additionalProperties === false)
        return false;
    return !isRecord(schema.additionalProperties) || matchesSchema(entry, schema.additionalProperties, root);
};
const matchesObject = (value, schema, root) => {
    if (!isRecord(value))
        return true;
    const entries = Object.entries(value);
    return hasRequiredKeys(value, schema.required) && entries.every(([key, entry]) => matchesProperty(entry, key, schema, root));
};
const keywordChecks = [
    matchesReference, matchesAllOf, matchesAnyOf, matchesOneOf, matchesConst, matchesEnum,
    matchesType, matchesNumber, matchesString, matchesArray, matchesObject,
];
export const matchesSchema = (value, schema, root = schema) => {
    if (schema === true)
        return true;
    if (!isRecord(schema))
        return false;
    return keywordChecks.every((check) => check(value, schema, root));
};
//# sourceMappingURL=jsonSchema.js.map