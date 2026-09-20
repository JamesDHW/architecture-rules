import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
export const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const require = createRequire(import.meta.url);
let nativeSchema;
export const getNativeSchema = () => {
    if (nativeSchema === undefined) {
        const value = JSON.parse(readFileSync(join(dirname(require.resolve("oxlint/package.json")), "configuration_schema.json"), "utf8"));
        if (!object(value))
            throw new Error("Invalid installed Oxlint schema");
        nativeSchema = value;
    }
    return nativeSchema;
};
/** Small interpreter for the JSON Schema vocabulary used by the pinned Oxlint schemas. */
export const matchesSchema = (value, schema, root = schema) => {
    if (schema === true)
        return true;
    if (schema === false || !object(schema))
        return false;
    if (typeof schema.$ref === "string") {
        let target = root;
        for (const key of schema.$ref.replace(/^#\//, "").split("/"))
            target = object(target) ? target[key] : undefined;
        if (!matchesSchema(value, target, root))
            return false;
    }
    for (const [name, method] of [["allOf", "every"], ["anyOf", "some"]]) {
        const variants = schema[name];
        if (Array.isArray(variants) && !variants[method]((item) => matchesSchema(value, item, root)))
            return false;
    }
    if (Array.isArray(schema.oneOf) && schema.oneOf.filter((item) => matchesSchema(value, item, root)).length !== 1)
        return false;
    if ("const" in schema && JSON.stringify(value) !== JSON.stringify(schema.const))
        return false;
    if (Array.isArray(schema.enum) && !schema.enum.some((item) => JSON.stringify(item) === JSON.stringify(value)))
        return false;
    const typeMatches = (type) => type === "object" ? object(value) : type === "array" ? Array.isArray(value)
        : type === "null" ? value === null : type === "integer" ? typeof value === "number" && Number.isInteger(value) : typeof value === type;
    if (schema.type !== undefined && !(Array.isArray(schema.type) ? schema.type.some(typeMatches) : typeMatches(schema.type)))
        return false;
    if (typeof value === "number") {
        if (typeof schema.minimum === "number" && value < schema.minimum)
            return false;
        if (typeof schema.maximum === "number" && value > schema.maximum)
            return false;
        if (typeof schema.format === "string" && schema.format.startsWith("uint")) {
            if (!Number.isInteger(value) || value < 0)
                return false;
            if (schema.format === "uint8" && value > 255)
                return false;
            if (schema.format === "uint32" && value > 4294967295)
                return false;
        }
    }
    if (typeof value === "string") {
        if (typeof schema.minLength === "number" && value.length < schema.minLength)
            return false;
        if (typeof schema.maxLength === "number" && value.length > schema.maxLength)
            return false;
        if (typeof schema.pattern === "string" && !new RegExp(schema.pattern).test(value))
            return false;
    }
    if (Array.isArray(value)) {
        if (typeof schema.minItems === "number" && value.length < schema.minItems)
            return false;
        if (typeof schema.maxItems === "number" && value.length > schema.maxItems)
            return false;
        if (schema.uniqueItems === true && new Set(value.map((item) => JSON.stringify(item))).size !== value.length)
            return false;
        if (Array.isArray(schema.items)) {
            if (schema.additionalItems === false && value.length > schema.items.length)
                return false;
            const items = schema.items;
            if (!value.every((item, index) => index >= items.length ? schema.additionalItems !== false : matchesSchema(item, items[index], root)))
                return false;
        }
        else if (schema.items !== undefined && !value.every((item) => matchesSchema(item, schema.items, root)))
            return false;
    }
    if (object(value)) {
        if (Array.isArray(schema.required) && !schema.required.every((key) => typeof key === "string" && key in value))
            return false;
        const properties = object(schema.properties) ? schema.properties : {};
        for (const [key, entry] of Object.entries(value)) {
            if (key in properties) {
                if (!matchesSchema(entry, properties[key], root))
                    return false;
            }
            else if (schema.additionalProperties === false)
                return false;
            else if (object(schema.additionalProperties) && !matchesSchema(entry, schema.additionalProperties, root))
                return false;
        }
    }
    return true;
};
//# sourceMappingURL=schema.js.map