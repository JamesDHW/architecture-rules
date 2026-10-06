import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { isRecord } from "../core/guards.js";
import { isArchitecture } from "../config/defineArchitecture.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatchAsync } from "../errors/tryCatch.js";
import type { RunArgs } from "./parseArgs.js";

const configNames: readonly string[] = ["architecture.config.ts", "architecture.config.mts"];

/** --config when given, otherwise the first conventional config in the target directory. */
export const configPathFor = (args: RunArgs): string => {
  const discovered = configNames.map((name) => resolve(args.target, name)).find((path) => existsSync(path));
  return resolve(args.config ?? discovered ?? resolve(args.target, "architecture.config.ts"));
};

/** A .ts config in a package without "type": "module" (e.g. a CommonJS Next app) is still ESM; skip Node's reparse warning. */
const loadTypeScriptConfigAsModule = (configPath: string, configUrl: string): void => {
  const isTypeScriptConfig = configPath.endsWith(".ts");
  registerHooks({
    load: (url, context, nextLoad) => {
      const isConfigModule = url === configUrl && isTypeScriptConfig;
      return nextLoad(url, isConfigModule ? { ...context, format: "module-typescript" } : context);
    },
  });
};

const importConfig = async (configUrl: string): Promise<unknown> => {
  // oxlint-disable-next-line architecture/allowed-imports -- Load the user-selected trusted architecture definition.
  return import(configUrl);
};

/** Loads and validates the default export of architecture.config.ts. */
export const loadArchitecture = async (configPath: string): Promise<Architecture | ArchitectureError> => {
  if (!existsSync(configPath)) return new ArchitectureError([`Required architecture configuration not found: ${configPath}`]);
  const configUrl = pathToFileURL(configPath).href;
  loadTypeScriptConfigAsModule(configPath, configUrl);
  const loaded = await tryCatchAsync(async () => importConfig(configUrl));
  if (loaded instanceof ArchitectureError) return loaded;
  const definition = isRecord(loaded) ? loaded.default : undefined;
  if (isArchitecture(definition)) return definition;
  return new ArchitectureError(["Configuration must default-export defineArchitecture(...)"]);
};
