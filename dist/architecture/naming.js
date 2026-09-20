import { basename } from "node:path";
export const namingError = (path, policy) => {
    const name = basename(path);
    if (policy.allowedNames?.includes(name))
        return undefined;
    let stem = name.replace(/(?:\.d)?\.[cm]?[jt]sx?$/i, "");
    const suffix = [...(policy.suffixes ?? [])].sort((a, b) => b.length - a.length).find((part) => stem.endsWith(part));
    if (suffix !== undefined)
        stem = stem.slice(0, -suffix.length);
    const camel = /^[a-z][A-Za-z0-9]*$/.test(stem);
    const pascal = /^[A-Z][A-Za-z0-9]*$/.test(stem);
    const valid = policy.case === "camel" ? camel : policy.case === "pascal" ? pascal : camel || pascal;
    if (!valid)
        return `Filename '${name}' must use ${policy.case} case${suffix === undefined ? "" : ` before ${suffix}`}.`;
    if (policy.prefix !== undefined && !stem.startsWith(policy.prefix))
        return `Filename '${name}' must start with '${policy.prefix}'.`;
    return undefined;
};
export const namingSchema = {
    type: "object",
    properties: {
        case: { enum: ["camel", "pascal", "pascalOrCamel"] },
        prefix: { type: "string", minLength: 1 },
        suffixes: { type: "array", items: { type: "string", minLength: 1 } },
        allowedNames: { type: "array", items: { type: "string", minLength: 1 } },
    },
    required: ["case"], additionalProperties: false,
};
//# sourceMappingURL=naming.js.map