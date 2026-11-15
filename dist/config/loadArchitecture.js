import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isRecord } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatchAsync } from "../errors/tryCatch.js";
import { isArchitecture } from "./defineArchitecture.js";
const configNames = ["architecture.config.ts", "architecture.config.mts"];
/** The given config path, otherwise the first conventional config in the target directory. */
export const configPathFor = (target, config) => {
    const discovered = configNames.map((name) => resolve(target, name)).find((path) => existsSync(path));
    return resolve(config ?? discovered ?? resolve(target, "architecture.config.ts"));
};
/** A .ts config in a package without "type": "module" (e.g. a CommonJS Next app) is still ESM; skip Node's reparse warning. */
const loadTypeScriptConfigAsModule = (configPath, configUrl) => {
    const isTypeScriptConfig = configPath.endsWith(".ts");
    registerHooks({
        load: (url, context, nextLoad) => {
            const isConfigModule = url === configUrl && isTypeScriptConfig;
            return nextLoad(url, isConfigModule ? { ...context, format: "module-typescript" } : context);
        },
    });
};
const importConfig = async (configUrl) => {
    // architecture-disable-next-line allowed-imports -- Load the user-selected trusted architecture definition.
    return import(configUrl);
};
/**
 * Loads and validates the default export of architecture.config.ts. A long-running caller passes a new reload
 * number to read an edited configuration; Node caches each module URL once.
 */
export const loadArchitecture = async (configPath, reload) => {
    if (!existsSync(configPath))
        return new ArchitectureError([`Required architecture configuration not found: ${configPath}`]);
    const configUrl = `${pathToFileURL(configPath).href}${reload === undefined ? "" : `?reload=${reload}`}`;
    loadTypeScriptConfigAsModule(configPath, configUrl);
    const loaded = await tryCatchAsync(async () => importConfig(configUrl));
    if (loaded instanceof ArchitectureError)
        return loaded;
    const definition = isRecord(loaded) ? loaded.default : undefined;
    if (isArchitecture(definition))
        return definition;
    return new ArchitectureError(["Configuration must default-export defineArchitecture(...)"]);
};
//# sourceMappingURL=loadArchitecture.js.map