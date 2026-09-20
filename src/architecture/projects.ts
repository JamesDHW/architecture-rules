import { API, type Project, type Snapshot } from "typescript/unstable/sync";
import { createRequire } from "node:module";
import { existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import type { Architecture } from "./types.js";
import { infrastructure, inside, safePath, sourceFile } from "./paths.js";
import type { Issue } from "./inventory.js";
import { object } from "./schema.js";
import { rules } from "../rules/index.js";

const require = createRequire(import.meta.url);
const compiler = join(dirname(require.resolve("typescript/package.json")), "bin/tsc");
const strictFlags = ["noImplicitAny", "noImplicitThis", "strictNullChecks", "strictFunctionTypes", "strictBindCallApply", "strictPropertyInitialization", "strictBuiltinIteratorReturn", "alwaysStrict", "useUnknownInCatchVariables"];

export const compilerIssues = (architecture: Architecture, project: string, options: Record<string, unknown>): Issue[] => {
  const issues: Issue[] = [];
  const report = (ruleId: string, message: string) => issues.push({ ruleId, file: project, message });
  for (const rule of rules) {
    if (rule.enforcement.type !== "typescript" || architecture.defaults.rules[rule.id]?.severity === "off") continue;
    for (const [key, expected] of Object.entries(rule.enforcement.compilerOptions)) {
      if (options[key] !== expected) report(rule.id, `Expected effective compilerOptions.${key} = ${JSON.stringify(expected)}; received ${JSON.stringify(options[key]) ?? "unset"}. Extend architecture-rules/tsconfig.base.json or set it explicitly.`);
    }
    if (rule.id === "strict-typescript") {
      for (const key of strictFlags) if (options[key] === false) report(rule.id, `Explicit ${key}: false weakens strict mode.`);
    }
  }
  if (options.noCheck === true) report("compiler-checking", "noCheck disables required TypeScript verification.");
  return issues;
};

export type Projects = { readonly api: API; readonly snapshot: Snapshot; readonly projects: readonly Project[]; readonly sources: ReadonlySet<string>; readonly issues: readonly Issue[]; readonly close: () => void };

export const openProjects = (root: string, architecture: Architecture): Projects => {
  // --showConfig uses the installed TS parser for JSONC, extends, include, and references.
  const configs = new Map<string, Record<string, unknown>>();
  const visit = (path: string): void => {
    if (configs.has(path)) return;
    if (!existsSync(path) || !inside(realpathSync(root), realpathSync(path))) throw new Error(`Missing or outside-root tsconfig: ${path}`);
    const result = spawnSync(process.execPath, [compiler, "--showConfig", "-p", path], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    if (result.error !== undefined || result.status !== 0) throw new Error(`Cannot resolve ${path}: ${result.error?.message ?? result.stdout + result.stderr}`);
    const config: unknown = JSON.parse(result.stdout);
    if (!object(config) || !object(config.compilerOptions)) throw new Error(`Invalid resolved config: ${path}`);
    configs.set(path, config.compilerOptions);
    if (architecture.projects.references === "follow" && Array.isArray(config.references)) {
      for (const reference of config.references) {
        if (!object(reference) || typeof reference.path !== "string") throw new Error(`Invalid reference in ${path}`);
        let target = resolve(dirname(path), reference.path);
        if (!target.endsWith(".json")) target = join(target, "tsconfig.json");
        if (!inside(root, target)) throw new Error(`Reference escapes root: ${target}`);
        visit(target);
      }
    }
  };
  for (const path of architecture.projects.tsconfigs) visit(safePath(root, path));
  const api = new API({ cwd: root });
  try {
    const snapshot = api.updateSnapshot({ openProjects: [...configs.keys()] });
    const projects = snapshot.getProjects().filter((project) => configs.has(project.configFileName));
    if (projects.length !== configs.size) throw new Error("TypeScript did not open every configured project");
    const sources = new Set<string>();
    const issues: Issue[] = [];
    for (const project of projects) {
      issues.push(...compilerIssues(architecture, project.configFileName, configs.get(project.configFileName) ?? {}));
      for (const path of project.program.getSourceFileNames()) {
        const metadata = project.program.getSourceFileMetadata(path);
        if (metadata?.isDefaultLibrary || !sourceFile(path)) continue;
        const actual = realpathSync(path);
        if (infrastructure(actual)) continue;
        if (actual !== path) issues.push({ ruleId: "project-membership", file: path, message: "Managed source loaded through a symlink has ambiguous identity; resolve the project to its real paths." });
        sources.add(actual);
      }
    }
    return { api, snapshot, projects, sources, issues, close: () => { snapshot.dispose(); api.close(); } };
  } catch (error) { api.close(); throw error; }
};
