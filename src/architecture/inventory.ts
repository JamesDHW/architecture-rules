import { existsSync, realpathSync } from "node:fs";
import type { Architecture, EffectivePolicy } from "./types.js";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";

export type Issue = { readonly ruleId: string; readonly file: string; readonly message: string; readonly line?: number };
export type ClassifiedFile = { readonly path: string; readonly relative: string; readonly type: string; readonly policy: EffectivePolicy };
export type Inventory = { readonly files: readonly ClassifiedFile[]; readonly issues: readonly Issue[] };

export const classify = (architecture: Architecture, path: string): readonly string[] => Object.entries(architecture.fileTypes)
  .filter(([, type]) => matches(path, type.files) && !matches(path, type.exclude ?? []))
  .map(([name]) => name);

/** TypeScript owns membership. Never rescan the root or reinterpret tsconfig globs. */
export const inventory = (root: string, architecture: Architecture, sources: ReadonlySet<string>): Inventory => {
  root = realpathSync(root);
  const issues: Issue[] = [];
  const files: ClassifiedFile[] = [];
  for (const path of [...sources].sort()) {
    if (infrastructure(path) || !sourceFile(path)) continue;
    const relative = relativePath(root, path);
    if (!existsSync(path)) {
      issues.push({ ruleId: "file-inventory", file: relative, message: "TypeScript program source is missing from disk." });
      continue;
    }
    if (!inside(root, path) || !inside(root, realpathSync(path))) {
      issues.push({ ruleId: "project-membership", file: path, message: "Project source escapes the architecture root." });
      continue;
    }
    if (realpathSync(path) !== path) {
      issues.push({ ruleId: "project-membership", file: relative, message: "Managed source loaded through a symlink has ambiguous identity." });
      continue;
    }
    const types = classify(architecture, relative);
    const type = types[0];
    if (types.length !== 1 || type === undefined) {
      issues.push({ ruleId: "file-classification", file: relative, message: types.length === 0 ? "Source matches no file type." : `Source matches multiple file types: ${types.join(", ")}` });
      continue;
    }
    const policy = architecture.fileTypes[type]?.policy;
    if (policy !== undefined) files.push({ path, relative, type, policy });
  }
  return { files, issues };
};
