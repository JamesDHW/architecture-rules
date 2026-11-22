import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { configPathFor, loadArchitecture } from "../config/loadArchitecture.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { allOrError } from "../errors/results.js";
import { tryCatch } from "../errors/tryCatch.js";
import { inspectArchitecture } from "../runner/runner.js";
export const loadProject = async (target, config) => {
    const configPath = configPathFor(target, config);
    const architecture = await loadArchitecture(configPath);
    if (architecture instanceof ArchitectureError)
        return architecture;
    const root = tryCatch(() => dirname(realpathSync(configPath)));
    return root instanceof ArchitectureError ? root : { root, configPath, architecture };
};
/** --file paths as the real absolute paths the checker compares, resolved from the working directory. */
export const selectedFiles = (paths) => {
    if (paths === undefined)
        return {};
    const files = allOrError(paths.map((path) => tryCatch(() => realpathSync(resolve(path)))));
    return files instanceof ArchitectureError ? files : { files };
};
/** Loads the configuration and runs the whole check, without printing anything. */
export const inspectProject = async (target, config, options = {}) => {
    const project = await loadProject(target, config);
    if (project instanceof ArchitectureError)
        return project;
    const result = await inspectArchitecture(project.root, project.architecture, { ...options, configFile: project.configPath });
    return result instanceof ArchitectureError ? result : { ...project, result };
};
//# sourceMappingURL=inspectProject.js.map