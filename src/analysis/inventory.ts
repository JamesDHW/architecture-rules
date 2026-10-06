import { existsSync, realpathSync } from "node:fs";

import { isPresent } from "../core/guards.js";
import type { Architecture, EffectivePolicy } from "../config/types.js";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";

export type Issue = { readonly ruleId: string; readonly file: string; readonly message: string; readonly line?: number };
export type ClassifiedFile = { readonly path: string; readonly relative: string; readonly type: string; readonly policy: EffectivePolicy };
export type Inventory = { readonly files: readonly ClassifiedFile[]; readonly issues: readonly Issue[] };

type Classification = { readonly file?: ClassifiedFile; readonly issue?: Issue };

export const classify = (architecture: Architecture, path: string): readonly string[] => {
  return Object.entries(architecture.fileTypes)
    .filter(([, type]) => matches(path, type.files) && !matches(path, type.exclude ?? []))
    .map(([name]) => name);
};

const isGovernedSource = (path: string): boolean => !infrastructure(path) && sourceFile(path);

const sourceIssue = (root: string, path: string, relative: string): Issue | undefined => {
  if (!existsSync(path)) return { ruleId: "file-inventory", file: relative, message: "TypeScript program source is missing from disk." };
  const real = realpathSync(path);
  const escapesRoot = !inside(root, path) || !inside(root, real);
  if (escapesRoot) return { ruleId: "project-membership", file: path, message: "Project source escapes the architecture root." };
  if (real !== path) return { ruleId: "project-membership", file: relative, message: "Managed source loaded through a symlink has ambiguous identity." };
  return undefined;
};

const classificationIssue = (relative: string, types: readonly string[]): Issue => {
  const message = types.length === 0 ? "Source matches no file type." : `Source matches multiple file types: ${types.join(", ")}`;
  return { ruleId: "file-classification", file: relative, message };
};

const onlyEntry = (types: readonly string[]): string | undefined => types.length === 1 ? types.at(0) : undefined;

const classifySource = (root: string, architecture: Architecture, path: string): Classification => {
  const relative = relativePath(root, path);
  const problem = sourceIssue(root, path, relative);
  if (problem !== undefined) return { issue: problem };
  const types = classify(architecture, relative);
  const type = onlyEntry(types);
  if (type === undefined) return { issue: classificationIssue(relative, types) };
  const policy = architecture.fileTypes[type]?.policy;
  return policy === undefined ? {} : { file: { path, relative, type, policy } };
};

/** TypeScript owns membership. Never rescan the root or reinterpret tsconfig globs. */
export const inventory = (rootPath: string, architecture: Architecture, sources: ReadonlySet<string>): Inventory => {
  const root = realpathSync(rootPath);
  const classified = [...sources].filter(isGovernedSource).toSorted().map((path) => classifySource(root, architecture, path));
  return {
    files: classified.map((entry) => entry.file).filter(isPresent),
    issues: classified.map((entry) => entry.issue).filter(isPresent),
  };
};
