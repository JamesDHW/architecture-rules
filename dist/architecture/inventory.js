import { existsSync, realpathSync } from "node:fs";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";
export const classify = (architecture, path) => Object.entries(architecture.fileTypes)
    .filter(([, type]) => matches(path, type.files) && !matches(path, type.exclude ?? []))
    .map(([name]) => name);
/** TypeScript owns membership. Never rescan the root or reinterpret tsconfig globs. */
export const inventory = (root, architecture, sources) => {
    root = realpathSync(root);
    const issues = [];
    const files = [];
    for (const path of [...sources].sort()) {
        if (infrastructure(path) || !sourceFile(path))
            continue;
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
        if (policy !== undefined)
            files.push({ path, relative, type, policy });
    }
    return { files, issues };
};
//# sourceMappingURL=inventory.js.map