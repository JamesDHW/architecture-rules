import { rules } from "../rules/index.js";
import { getNativeSchema, matchesSchema, object } from "./schema.js";
export const validateOptions = (id, options) => {
    const rule = rules.find((candidate) => candidate.id === id);
    if (rule === undefined)
        throw new Error(`Unknown rule: ${id}`);
    const enforcement = rule.enforcement;
    if (enforcement.type === "oxlint") {
        const root = getNativeSchema();
        const definitions = root.definitions;
        const map = object(definitions) ? definitions.DummyRuleMap : undefined;
        const properties = object(map) ? map.properties : undefined;
        const schema = object(properties) ? properties[enforcement.rule] : undefined;
        if (!matchesSchema(["error", ...options], schema, root))
            throw new Error(`Invalid options for ${id}: ${JSON.stringify(options)}`);
        return;
    }
    if (enforcement.type === "custom-oxlint") {
        const schema = "options" in rule ? rule.options.schema : enforcement.implementation.meta?.schema ?? [];
        const tupleSchema = Array.isArray(schema) ? { type: "array", items: schema, maxItems: schema.length, additionalItems: false } : schema;
        if (!matchesSchema(options, tupleSchema))
            throw new Error(`Invalid options for ${id}: ${JSON.stringify(options)}`);
        if ("options" in rule)
            rule.options.validate?.(options);
        return;
    }
    if (options.length > 0)
        throw new Error(`${id} does not accept options`);
};
export const defaultRules = () => Object.fromEntries(rules.map((rule) => {
    const enforcement = rule.enforcement;
    if (enforcement.type === "advisory" || enforcement.type === "typescript" || enforcement.type === "architecture")
        return [rule.id, { severity: "error", options: [], origin: "rule default" }];
    const configuration = enforcement.configuration;
    return [rule.id, {
            severity: typeof configuration === "string" ? configuration : configuration[0],
            options: typeof configuration === "string" ? [] : configuration.slice(1),
            origin: "rule default",
        }];
}));
export const overrideRules = (inherited, input, origin, project) => {
    const result = { ...inherited };
    if (input === undefined)
        return result;
    if (!object(input))
        throw new Error(`${origin}.rules must be an object`);
    for (const [id, setting] of Object.entries(input)) {
        const registered = rules.find((rule) => rule.id === id);
        const previous = inherited[id];
        if (registered === undefined || previous === undefined)
            throw new Error(`Unknown rule: ${id}`);
        if (registered.enforcement.type === "architecture")
            throw new Error(`${id} is a mandatory structural check`);
        if (id === "file-naming" || id === "allowed-imports")
            throw new Error("Use naming/imports, not a direct architecture rule override");
        if (!project && registered.enforcement.type === "typescript")
            throw new Error(`${id} is a project-wide compiler requirement, not a file-type rule`);
        let severity = previous.severity;
        let options = previous.options;
        let reason;
        if (typeof setting === "string")
            severity = setting;
        else if (Array.isArray(setting)) {
            severity = setting[0];
            options = setting.slice(1);
        }
        else if (object(setting)) {
            if (Object.keys(setting).some((key) => !["severity", "options", "reason"].includes(key)))
                throw new Error(`Unknown setting field for ${id}`);
            if (typeof setting.reason !== "string" || setting.reason.trim().length === 0)
                throw new Error(`${id} requires a nonempty reason`);
            reason = setting.reason;
            severity = setting.severity ?? severity;
            if ("options" in setting)
                options = Array.isArray(setting.options) ? setting.options : [setting.options];
        }
        else
            throw new Error(`Invalid setting for ${id}`);
        if (severity !== "off" && severity !== "warn" && severity !== "error")
            throw new Error(`Invalid severity for ${id}`);
        if (registered.enforcement.type === "typescript" && severity === "warn")
            throw new Error(`${id} supports error/off only`);
        validateOptions(id, options);
        result[id] = { severity, options, origin, ...(reason === undefined ? {} : { reason }) };
    }
    return result;
};
//# sourceMappingURL=normalizeRules.js.map