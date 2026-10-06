import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { API } from "typescript/unstable/sync";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { allOrError } from "../errors/results.js";
import { tryCatch } from "../errors/tryCatch.js";
import { compilerIssues } from "./compilerRequirements.js";
import { infrastructure, inside, safePath, sourceFile } from "./paths.js";
const requireFromPackage = createRequire(import.meta.url);
const compiler = join(dirname(requireFromPackage.resolve("typescript/package.json")), "bin/tsc");
const isShownConfig = (value) => isRecord(value) && isRecord(value.compilerOptions);
const isReference = (value) => isRecord(value) && isString(value.path);
const referenceTarget = (root, configPath, reference) => {
    if (!isReference(reference))
        return new ArchitectureError([`Invalid reference in ${configPath}`]);
    const resolved = resolve(dirname(configPath), reference.path);
    const target = resolved.endsWith(".json") ? resolved : join(resolved, "tsconfig.json");
    if (inside(root, target))
        return target;
    return new ArchitectureError([`Reference escapes root: ${target}`]);
};
const declaredReferences = (config, follow) => {
    if (!follow)
        return [];
    return isUnknownArray(config.references) ? config.references : [];
};
const parseShownConfig = (root, configPath, output, follow) => {
    const config = tryCatch(() => JSON.parse(output));
    if (config instanceof ArchitectureError)
        return config;
    if (!isShownConfig(config))
        return new ArchitectureError([`Invalid resolved config: ${configPath}`]);
    const references = allOrError(declaredReferences(config, follow).map((reference) => referenceTarget(root, configPath, reference)));
    if (references instanceof ArchitectureError)
        return references;
    return { compilerOptions: config.compilerOptions, references };
};
/** --showConfig resolves compiler settings and references; only the program determines source membership. */
const showConfig = (root, configPath, follow) => {
    const isInsideRoot = existsSync(configPath) && inside(root, realpathSync(configPath));
    if (!isInsideRoot)
        return new ArchitectureError([`Missing or outside-root tsconfig: ${configPath}`]);
    const result = spawnSync(process.execPath, [compiler, "--showConfig", "-p", configPath], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    const failed = result.error !== undefined || result.status !== 0;
    if (failed)
        return new ArchitectureError([`Cannot resolve ${configPath}: ${result.error?.message ?? result.stdout + result.stderr}`]);
    return parseShownConfig(root, configPath, result.stdout, follow);
};
/** Resolves the pending configs depth-first, following references when asked, each config once. */
const resolveConfigs = (root, pending, resolved, follow) => {
    const [configPath, ...rest] = pending;
    if (configPath === undefined)
        return resolved;
    if (resolved.has(configPath))
        return resolveConfigs(root, rest, resolved, follow);
    const config = showConfig(root, configPath, follow);
    if (config instanceof ArchitectureError)
        return config;
    return resolveConfigs(root, [...config.references, ...rest], new Map([...resolved, [configPath, config]]), follow);
};
const isProjectSource = (project, path) => {
    const isDefaultLibrary = project.program.getSourceFileMetadata(path)?.isDefaultLibrary === true;
    return !isDefaultLibrary && sourceFile(path);
};
const membership = (architecture, project, configs) => {
    const files = project.program.getSourceFileNames()
        .filter((path) => isProjectSource(project, path))
        .map((path) => ({ path, real: realpathSync(path) }))
        .filter(({ real }) => !infrastructure(real));
    const symlinked = files.filter(({ path, real }) => path !== real).map(({ path }) => ({
        ruleId: "project-membership",
        file: path,
        message: "Managed source loaded through a symlink has ambiguous identity; resolve the project to its real paths.",
    }));
    const options = configs.get(project.configFileName)?.compilerOptions ?? {};
    return { sources: files.map(({ real }) => real), issues: [...compilerIssues(architecture, project.configFileName, options), ...symlinked] };
};
const loadProjects = (api, architecture, configs) => {
    const snapshot = api.updateSnapshot({ openProjects: [...configs.keys()] });
    const projects = snapshot.getProjects().filter((project) => configs.has(project.configFileName));
    if (projects.length !== configs.size)
        return new ArchitectureError(["TypeScript did not open every configured project"]);
    const memberships = projects.map((project) => membership(architecture, project, configs));
    const close = () => {
        snapshot.dispose();
        api.close();
    };
    return { api, snapshot, projects, sources: new Set(memberships.flatMap((entry) => entry.sources)), issues: memberships.flatMap((entry) => entry.issues), close };
};
const openSnapshot = (root, architecture, configs) => {
    const api = tryCatch(() => new API({ cwd: root }));
    if (api instanceof ArchitectureError)
        return api;
    const opened = tryCatch(() => loadProjects(api, architecture, configs));
    if (opened instanceof ArchitectureError) {
        api.close();
    }
    return opened;
};
/** Opens every configured TypeScript project; the caller must close() the result. */
export const openProjects = (rootPath, architecture) => {
    const root = realpathSync(rootPath);
    const configPaths = allOrError(architecture.projects.tsconfigs.map((path) => safePath(root, path)));
    if (configPaths instanceof ArchitectureError)
        return configPaths;
    const configs = resolveConfigs(root, configPaths, new Map(), architecture.projects.references === "follow");
    if (configs instanceof ArchitectureError)
        return configs;
    return openSnapshot(root, architecture, configs);
};
//# sourceMappingURL=projects.js.map