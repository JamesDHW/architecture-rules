import { dirname, resolve } from "node:path";
import { isRecord, isString, isStringArray } from "../core/guards.js";
import { withProjects } from "./withProjects.js";
const pathsOf = (options) => {
    const { paths } = options;
    if (!isRecord(paths))
        return {};
    return Object.fromEntries(Object.entries(paths).filter((entry) => isStringArray(entry[1])));
};
/** Every project's compilerOptions.paths. Targets are relative to baseUrl when it is set, else to the tsconfig. */
export const projectAliases = async (root, architecture) => {
    return withProjects(root, architecture, async (opened) => opened.projects.map((project) => {
        const options = opened.compilerOptions.get(project.configFileName) ?? {};
        const directory = dirname(project.configFileName);
        const base = isString(options.baseUrl) ? resolve(directory, options.baseUrl) : directory;
        const sources = new Set(project.program.getSourceFileNames());
        return { base, paths: pathsOf(options), sources };
    }));
};
//# sourceMappingURL=projectAliases.js.map