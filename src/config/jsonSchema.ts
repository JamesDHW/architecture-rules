import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { UNSIGNED_FORMAT_MAXIMUM } from "./configuration.constants.js";

/** Small interpreter for the JSON Schema vocabulary used by the pinned Oxlint schemas. */
type Schema = Readonly<Record<string, unknown>>;
type KeywordCheck = (value: unknown, schema: Schema, root: unknown) => boolean;

const resolvePath = (target: unknown, keys: readonly string[]): unknown => {
  const [key, ...rest] = keys;
  if (key === undefined) return target;
  return resolvePath(isRecord(target) ? target[key] : undefined, rest);
};

const sameJson = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right);

const matchesTypeName = (value: unknown, type: unknown): boolean => {
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

const isWithinLength = (length: number, minimum: unknown, maximum: unknown): boolean => {
  const isTooShort = typeof minimum === "number" && length < minimum;
  const isTooLong = typeof maximum === "number" && length > maximum;
  return !isTooShort && !isTooLong;
};

const isUnsignedFormat = (format: unknown): format is string => isString(format) && format.startsWith("uint");

const matchesUnsignedFormat = (value: number, format: unknown): boolean => {
  if (!isUnsignedFormat(format)) return true;
  const maximum = UNSIGNED_FORMAT_MAXIMUM[format] ?? Number.POSITIVE_INFINITY;
  return Number.isInteger(value) && value >= 0 && value <= maximum;
};

const matchesPattern = (value: string, pattern: unknown): boolean => {
  if (!isString(pattern)) return true;
  return new RegExp(pattern).test(value);
};

const hasUniqueEntries = (entries: readonly unknown[]): boolean => {
  const serialized = new Set(entries.map((entry) => JSON.stringify(entry)));
  return serialized.size === entries.length;
};

const matchesReference: KeywordCheck = (value, schema, root) => {
  if (!isString(schema.$ref)) return true;
  return matchesSchema(value, resolvePath(root, schema.$ref.replace(/^#\//, "").split("/")), root);
};

const matchesAllOf: KeywordCheck = (value, schema, root) => {
  return !isUnknownArray(schema.allOf) || schema.allOf.every((variant) => matchesSchema(value, variant, root));
};

const matchesAnyOf: KeywordCheck = (value, schema, root) => {
  return !isUnknownArray(schema.anyOf) || schema.anyOf.some((variant) => matchesSchema(value, variant, root));
};

const matchesOneOf: KeywordCheck = (value, schema, root) => {
  return !isUnknownArray(schema.oneOf) || schema.oneOf.filter((variant) => matchesSchema(value, variant, root)).length === 1;
};

const matchesConst: KeywordCheck = (value, schema) => !("const" in schema) || sameJson(value, schema.const);

const matchesEnum: KeywordCheck = (value, schema) => {
  return !isUnknownArray(schema.enum) || schema.enum.some((option) => sameJson(option, value));
};

const matchesType: KeywordCheck = (value, schema) => {
  if (schema.type === undefined) return true;
  const types = isUnknownArray(schema.type) ? schema.type : [schema.type];
  return types.some((type) => matchesTypeName(value, type));
};

const matchesNumber: KeywordCheck = (value, schema) => {
  if (typeof value !== "number") return true;
  const isBelowMinimum = typeof schema.minimum === "number" && value < schema.minimum;
  const isAboveMaximum = typeof schema.maximum === "number" && value > schema.maximum;
  return !isBelowMinimum && !isAboveMaximum && matchesUnsignedFormat(value, schema.format);
};

const matchesString: KeywordCheck = (value, schema) => {
  if (!isString(value)) return true;
  return isWithinLength(value.length, schema.minLength, schema.maxLength) && matchesPattern(value, schema.pattern);
};

const matchesTupleEntries = (entries: readonly unknown[], items: readonly unknown[], schema: Schema, root: unknown): boolean => {
  const allowsExtraEntries = schema.additionalItems !== false;
  const fitsTuple = allowsExtraEntries || entries.length <= items.length;
  return fitsTuple && entries.every((entry, index) => index >= items.length || matchesSchema(entry, items.at(index), root));
};

const matchesEntries = (entries: readonly unknown[], schema: Schema, root: unknown): boolean => {
  const { items } = schema;
  if (isUnknownArray(items)) return matchesTupleEntries(entries, items, schema, root);
  return items === undefined || entries.every((entry) => matchesSchema(entry, items, root));
};

const matchesArray: KeywordCheck = (value, schema, root) => {
  if (!isUnknownArray(value)) return true;
  const isDuplicated = schema.uniqueItems === true && !hasUniqueEntries(value);
  return !isDuplicated && isWithinLength(value.length, schema.minItems, schema.maxItems) && matchesEntries(value, schema, root);
};

const hasRequiredKeys = (value: Schema, required: unknown): boolean => {
  return !isUnknownArray(required) || required.every((key) => isString(key) && key in value);
};

const matchesProperty = (entry: unknown, key: string, schema: Schema, root: unknown): boolean => {
  const properties: Schema = isRecord(schema.properties) ? schema.properties : {};
  if (key in properties) return matchesSchema(entry, properties[key], root);
  if (schema.additionalProperties === false) return false;
  return !isRecord(schema.additionalProperties) || matchesSchema(entry, schema.additionalProperties, root);
};

const matchesObject: KeywordCheck = (value, schema, root) => {
  if (!isRecord(value)) return true;
  const entries = Object.entries(value);
  return hasRequiredKeys(value, schema.required) && entries.every(([key, entry]) => matchesProperty(entry, key, schema, root));
};

const keywordChecks: readonly KeywordCheck[] = [
  matchesReference, matchesAllOf, matchesAnyOf, matchesOneOf, matchesConst, matchesEnum,
  matchesType, matchesNumber, matchesString, matchesArray, matchesObject,
];

export const matchesSchema = (value: unknown, schema: unknown, root: unknown = schema): boolean => {
  if (schema === true) return true;
  if (!isRecord(schema)) return false;
  return keywordChecks.every((check) => check(value, schema, root));
};
