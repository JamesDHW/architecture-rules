import { dirname, resolve } from "node:path";

import { isRecord, isString, isStringArray } from "../core/guards.js";
import type { Architecture } from "../config/types.js";
import type { ArchitectureError } from "../errors/architectureError.js";
import { withProjects } from "./withProjects.js";

/** One TypeScript project's path aliases, with the directory their targets are relative to, and the files it holds. */
export type ProjectAliases = {
  readonly base: string;
  readonly paths: Readonly<Record<string, readonly string[]>>;
  readonly sources: ReadonlySet<string>;
};

const pathsOf = (options: Readonly<Record<string, unknown>>): Readonly<Record<string, readonly string[]>> => {
  const { paths } = options;
  if (!isRecord(paths)) return {};
  return Object.fromEntries(Object.entries(paths).filter((entry): entry is [string, readonly string[]] => isStringArray(entry[1])));
};

/** Every project's compilerOptions.paths. Targets are relative to baseUrl when it is set, else to the tsconfig. */
export const projectAliases = async (root: string, architecture: Architecture): Promise<readonly ProjectAliases[] | ArchitectureError> => {
  return withProjects(root, architecture, async (opened) => opened.projects.map((project) => {
    const options = opened.compilerOptions.get(project.configFileName) ?? {};
    const directory = dirname(project.configFileName);
    const base = isString(options.baseUrl) ? resolve(directory, options.baseUrl) : directory;
    const sources = new Set(project.program.getSourceFileNames());
    return { base, paths: pathsOf(options), sources };
  }));
};
