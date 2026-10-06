import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { isRecord } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
const requireFromPackage = createRequire(import.meta.url);
/** Oxlint's configuration schema, read at most once per process. */
const loaded = new Map();
const isSchemaOrError = (value) => value instanceof ArchitectureError || isRecord(value);
const readNativeSchema = () => {
    const parsed = tryCatch(() => {
        const path = join(dirname(requireFromPackage.resolve("oxlint/package.json")), "configuration_schema.json");
        return JSON.parse(readFileSync(path, "utf8"));
    });
    if (isSchemaOrError(parsed))
        return parsed;
    return new ArchitectureError(["Invalid installed Oxlint schema"]);
};
export const nativeSchema = () => {
    const cached = loaded.get("schema");
    if (cached !== undefined)
        return cached;
    const schema = readNativeSchema();
    loaded.set("schema", schema);
    return schema;
};
//# sourceMappingURL=nativeSchema.state.js.map