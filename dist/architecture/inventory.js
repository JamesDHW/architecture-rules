import { lstatSync, readdirSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";
export const classify = (architecture, path) => Object.entries(architecture.fileTypes)
    .filter(([, type]) => matches(path, type.files) && !matches(path, type.exclude ?? []))
    .map(([name]) => name);
export const inventory = (root, architecture, sources, includes) => {
    const issues = [];
    const files = [];
    const found = new Set();
    const generated = architecture.files.generated.flatMap((group) => group.files);
    const isInScope = (relative) => includes.some(({ configDir, patterns }) => matches(relativePath(configDir, relative), patterns));
    const visit = (dir) => {
        for (const name of readdirSync(dir).sort()) {
            const path = join(dir, name);
            const fileRelative = relativePath(root, path);
            if (infrastructure(fileRelative))
                continue;
            const stat = lstatSync(path);
            // Reject managed symlinks outright: prevents aliases from changing role identity.
            if (stat.isSymbolicLink()) {
                issues.push({ ruleId: "file-inventory", file: fileRelative, message: "Managed symlinks are not supported; use real files inside the architecture root." });
                continue;
            }
            if (matches(fileRelative, generated))
                continue;
            if (stat.isDirectory()) {
                visit(path);
                continue;
            }
            found.add(path);
            if (sources.has(path)) {
                const types = classify(architecture, fileRelative);
                const type = types[0];
                if (types.length !== 1 || type === undefined) {
                    issues.push({ ruleId: "file-classification", file: fileRelative, message: types.length === 0 ? "Source matches no file type." : `Source matches multiple file types: ${types.join(", ")}` });
                    continue;
                }
                const policy = architecture.fileTypes[type]?.policy;
                if (policy !== undefined)
                    files.push({ path, relative: fileRelative, type, policy });
            }
            else if (architecture.files.toolingFiles.includes(fileRelative)) {
                // Exact paths only, validated at configuration time. Imports cannot target these.
            }
            else if (sourceFile(path)) {
                if (isInScope(fileRelative)) {
                    issues.push({ ruleId: "project-membership", file: fileRelative, message: "Source is outside every configured TypeScript program." });
                }
            }
            else if (!isInScope(fileRelative)) {
                // Non-source file excluded from TypeScript: skip silently.
            }
            else if (!matches(fileRelative, architecture.files.otherFiles)) {
                issues.push({ ruleId: "file-inventory", file: fileRelative, message: "File is not permitted by files.otherFiles." });
            }
        }
    };
    visit(root);
    for (const source of sources) {
        if (infrastructure(source))
            continue;
        const sourceRelative = relativePath(root, source);
        if (isInScope(sourceRelative)) {
            if (!inside(root, source) || !inside(realpathSync(root), realpathSync(source))) {
                issues.push({ ruleId: "project-membership", file: source, message: "Project source escapes the architecture root." });
            }
            else if (matches(sourceRelative, generated)) {
                issues.push({ ruleId: "project-membership", file: sourceRelative, message: "Generated exclusions cannot hide a source loaded by a governed TypeScript program." });
            }
            else if (!found.has(source)) {
                issues.push({ ruleId: "project-membership", file: sourceRelative, message: "Program source is missing from the project inventory." });
            }
        }
    }
    return { files, issues };
};
//# sourceMappingURL=inventory.js.map