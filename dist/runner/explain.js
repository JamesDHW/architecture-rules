import { classify } from "../analysis/inventory.js";
import { configurationFile, relativePath, safePath } from "../analysis/paths.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { rules } from "../rules/index.js";
import { namingError } from "../rules/namingPolicy.js";
/** Prints how the architecture treats one file, as JSON; 1 when it is unclassified or the tree has structural issues. */
export const explainFile = (root, architecture, opened, tree, structural, file) => {
    const path = safePath(root, file);
    if (path instanceof ArchitectureError)
        return path;
    const relative = relativePath(root, path);
    const selected = tree.files.find((candidate) => candidate.path === path);
    const naming = selected?.policy.naming;
    const explanation = {
        file: relative,
        projects: opened.projects
            .filter((project) => project.program.getSourceFile(path) !== undefined)
            .map((project) => relativePath(root, project.configFileName)),
        matchingTypes: classify(architecture, relative).map((name) => ({ name, patterns: architecture.fileTypes[name]?.files })),
        policy: selected?.policy,
        namedExportsExempt: configurationFile(relative),
        namingIssue: naming === undefined ? undefined : namingError(relative, naming),
        advisoryRules: rules.filter((rule) => rule.enforcement.type === "advisory").map((rule) => ({ id: rule.id, description: rule.description })),
        issues: structural,
    };
    process.stdout.write(`${JSON.stringify(explanation, null, 2)}\n`);
    const failed = selected === undefined || structural.length > 0;
    return failed ? 1 : 0;
};
//# sourceMappingURL=explain.js.map