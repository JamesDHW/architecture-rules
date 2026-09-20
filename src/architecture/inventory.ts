import { lstatSync, readdirSync, realpathSync } from "node:fs";
import { join } from "node:path";
import type { Architecture, EffectivePolicy } from "./types.js";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";

export type Issue = { readonly ruleId: string; readonly file: string; readonly message: string; readonly line?: number };
export type ClassifiedFile = { readonly path: string; readonly relative: string; readonly type: string; readonly policy: EffectivePolicy };
export type Inventory = { readonly files: readonly ClassifiedFile[]; readonly issues: readonly Issue[] };

export const classify = (architecture: Architecture, path: string): readonly string[] => Object.entries(architecture.fileTypes)
  .filter(([, type]) => matches(path, type.files) && !matches(path, type.exclude ?? []))
  .map(([name]) => name);

export const inventory = (root: string, architecture: Architecture, sources: ReadonlySet<string>): Inventory => {
  const issues: Issue[] = [];
  const files: ClassifiedFile[] = [];
  const found = new Set<string>();
  const generated = architecture.files.generated.flatMap((group) => group.files);
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      const relative = relativePath(root, path);
      if (infrastructure(relative)) continue;
      const stat = lstatSync(path);
      // Reject managed symlinks outright: prevents aliases from changing role identity.
      if (stat.isSymbolicLink()) {
        issues.push({ ruleId: "file-inventory", file: relative, message: "Managed symlinks are not supported; use real files inside the architecture root." });
        continue;
      }
      if (matches(relative, generated)) continue;
      if (stat.isDirectory()) { visit(path); continue; }
      found.add(path);
      if (sources.has(path)) {
        const types = classify(architecture, relative);
        const type = types[0];
        if (types.length !== 1 || type === undefined) {
          issues.push({ ruleId: "file-classification", file: relative, message: types.length === 0 ? "Source matches no file type." : `Source matches multiple file types: ${types.join(", ")}` });
          continue;
        }
        const policy = architecture.fileTypes[type]?.policy;
        if (policy !== undefined) files.push({ path, relative, type, policy });
      } else if (architecture.files.toolingFiles.includes(relative)) {
        // Exact paths only, validated at configuration time. Imports cannot target these.
      } else if (sourceFile(relative)) {
        issues.push({ ruleId: "project-membership", file: relative, message: "Source is outside every configured TypeScript program." });
      } else if (!matches(relative, architecture.files.otherFiles)) {
        issues.push({ ruleId: "file-inventory", file: relative, message: "File is not permitted by files.otherFiles." });
      }
    }
  };
  visit(root);
  for (const source of sources) {
    if (infrastructure(source)) continue;
    const relative = relativePath(root, source);
    if (!inside(root, source) || !inside(realpathSync(root), realpathSync(source))) {
      issues.push({ ruleId: "project-membership", file: source, message: "Project source escapes the architecture root." });
    } else if (matches(relative, generated)) {
      issues.push({ ruleId: "project-membership", file: relative, message: "Generated exclusions cannot hide a source loaded by a governed TypeScript program." });
    } else if (!found.has(source)) {
      issues.push({ ruleId: "project-membership", file: relative, message: "Program source is missing from the project inventory." });
    }
  }
  return { files, issues };
};
