import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { configPathFor, loadArchitecture } from "../config/loadArchitecture.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { allOrError } from "../errors/results.js";
import { tryCatch } from "../errors/tryCatch.js";
import type { CheckResult } from "../runner/checkResult.js";
import { inspectArchitecture, type InspectOptions } from "../runner/runner.js";

/** A loaded configuration and the root it governs. */
export type LoadedProject = { readonly root: string; readonly configPath: string; readonly architecture: Architecture };

export type InspectedProject = LoadedProject & { readonly result: CheckResult };

export const loadProject = async (target: string, config: string | undefined): Promise<LoadedProject | ArchitectureError> => {
  const configPath = configPathFor(target, config);
  const architecture = await loadArchitecture(configPath);
  if (architecture instanceof ArchitectureError) return architecture;
  const root = tryCatch(() => dirname(realpathSync(configPath)));
  return root instanceof ArchitectureError ? root : { root, configPath, architecture };
};

/** --file paths as the real absolute paths the checker compares, resolved from the working directory. */
export const selectedFiles = (paths: readonly string[] | undefined): { readonly files?: readonly string[] } | ArchitectureError => {
  if (paths === undefined) return {};
  const files = allOrError(paths.map((path) => tryCatch(() => realpathSync(resolve(path)))));
  return files instanceof ArchitectureError ? files : { files };
};

/** Loads the configuration and runs the whole check, without printing anything. */
export const inspectProject = async (target: string, config: string | undefined, options: Omit<InspectOptions, "configFile"> = {}): Promise<InspectedProject | ArchitectureError> => {
  const project = await loadProject(target, config);
  if (project instanceof ArchitectureError) return project;
  const result = await inspectArchitecture(project.root, project.architecture, { ...options, configFile: project.configPath });
  return result instanceof ArchitectureError ? result : { ...project, result };
};
