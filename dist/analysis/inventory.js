import { existsSync, realpathSync } from "node:fs";
import { isPresent } from "../core/guards.js";
import { infrastructure, inside, matches, relativePath, sourceFile } from "./paths.js";
export const classify = (architecture, path) => {
    return Object.entries(architecture.layers)
        .filter(([, layer]) => matches(path, layer.files) && !matches(path, layer.exclude ?? []))
        .map(([name]) => name);
};
const isGovernedSource = (path) => !infrastructure(path) && sourceFile(path);
const sourceIssue = (root, path, relative) => {
    if (!existsSync(path))
        return { ruleId: "file-inventory", file: relative, message: "TypeScript program source is missing from disk." };
    const real = realpathSync(path);
    const escapesRoot = !inside(root, path) || !inside(root, real);
    if (escapesRoot)
        return { ruleId: "project-membership", file: path, message: "Project source escapes the architecture root." };
    if (real !== path)
        return { ruleId: "project-membership", file: relative, message: "Managed source loaded through a symlink has ambiguous identity." };
    return undefined;
};
const classificationIssue = (relative, layers) => {
    const message = layers.length === 0 ? "Source matches no layer." : `Source matches multiple layers: ${layers.join(", ")}`;
    return { ruleId: "file-classification", file: relative, message };
};
const onlyEntry = (layers) => layers.length === 1 ? layers.at(0) : undefined;
const classifySource = (root, architecture, path) => {
    const relative = relativePath(root, path);
    const problem = sourceIssue(root, path, relative);
    if (problem !== undefined)
        return { issue: problem };
    const layers = classify(architecture, relative);
    const layer = onlyEntry(layers);
    if (layer === undefined)
        return { issue: classificationIssue(relative, layers) };
    const policy = architecture.layers[layer]?.policy;
    return policy === undefined ? {} : { file: { path, relative, layer, policy } };
};
/** TypeScript owns membership. Never rescan the root or reinterpret tsconfig globs. */
export const inventory = (rootPath, architecture, sources) => {
    const root = realpathSync(rootPath);
    const classified = [...sources].filter(isGovernedSource).toSorted().map((path) => classifySource(root, architecture, path));
    return {
        files: classified.map((entry) => entry.file).filter(isPresent),
        issues: classified.map((entry) => entry.issue).filter(isPresent),
    };
};
//# sourceMappingURL=inventory.js.map