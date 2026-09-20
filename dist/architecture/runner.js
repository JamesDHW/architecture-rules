import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { inventory, classify } from "./inventory.js";
import { openProjects } from "./projects.js";
import { checkImports } from "./imports.js";
import { compileOxlintConfig } from "./compileOxlintConfig.js";
import { relativePath, safePath } from "./paths.js";
import { namingError } from "./naming.js";
import { checkSuppressions } from "./suppressions.js";
import { rules } from "../rules/index.js";
const require = createRequire(import.meta.url);
const oxlint = join(dirname(require.resolve("oxlint/package.json")), "bin/oxlint");
const execute = (args, cwd) => new Promise((finish) => {
    const child = spawn(process.execPath, [oxlint, ...args], { cwd, stdio: "inherit" });
    child.on("error", (error) => { process.stderr.write(`${error.message}\n`); finish(1); });
    child.on("close", (code) => finish(code ?? 1));
});
export const printIssues = (issues) => {
    for (const issue of issues)
        process.stderr.write(`${issue.file}${issue.line === undefined ? "" : `:${issue.line}`}: ${issue.ruleId}: ${issue.message}\n`);
};
export const checkArchitecture = async (root, architecture, options = {}) => {
    const opened = openProjects(root, architecture);
    try {
        const tree = inventory(root, architecture, opened.sources);
        const structural = [...opened.issues, ...tree.issues, ...checkSuppressions(tree.files, opened.projects)];
        if (options.explain !== undefined) {
            const path = safePath(root, options.explain);
            const relative = relativePath(root, path);
            const candidates = classify(architecture, relative);
            const selected = tree.files.find((file) => file.path === path);
            process.stdout.write(`${JSON.stringify({
                file: relative,
                projects: opened.projects.filter((project) => project.program.getSourceFile(path) !== undefined).map((project) => relativePath(root, project.configFileName)),
                matchingTypes: candidates.map((name) => ({ name, patterns: architecture.fileTypes[name]?.files })),
                policy: selected?.policy,
                namingIssue: selected?.policy.naming === undefined ? undefined : namingError(relative, selected.policy.naming),
                advisoryRules: rules.filter((rule) => rule.enforcement.type === "advisory").map((rule) => ({ id: rule.id, description: rule.description })),
                issues: structural,
            }, null, 2)}\n`);
            return selected === undefined || structural.length > 0 ? 1 : 0;
        }
        if (structural.length > 0) {
            printIssues(structural);
            return 1;
        }
        const imports = checkImports(root, tree.files, opened.projects);
        let lintCode = 0;
        if (tree.files.length > 0) {
            // Keep the generated config in the project root for Oxlint's relative globs.
            // The private directory is created after inventory and always removed.
            const temporary = mkdtempSync(join(root, ".architecture-run-"));
            try {
                const configPath = join(temporary, "oxlint.json");
                const config = compileOxlintConfig(tree.files, imports);
                writeFileSync(configPath, JSON.stringify(config));
                // Chunking prevents exceeding OS argv limits; every invocation uses all policies.
                for (const project of opened.projects) {
                    const projectFiles = tree.files.filter((file) => project.program.getSourceFile(file.path) !== undefined);
                    for (let start = 0; start < projectFiles.length; start += 100) {
                        const code = await execute(["--config", configPath, "--disable-nested-config", "--no-ignore", "--type-aware", "--tsconfig", project.configFileName, "--report-unused-disable-directives-severity", "error", ...(options.fix ? ["--fix"] : []), ...projectFiles.slice(start, start + 100).map((file) => file.path)], root);
                        if (code !== 0)
                            lintCode = code;
                    }
                }
            }
            finally {
                rmSync(temporary, { recursive: true, force: true });
            }
        }
        // Fixes can change imports as well as expressions. Revalidate the entire contract.
        if (options.fix)
            return await checkArchitecture(root, architecture);
        const checked = opened;
        try {
            let compilerErrors = 0;
            for (const project of checked.projects) {
                const diagnostics = [
                    ...project.program.getConfigFileParsingDiagnostics(),
                    ...project.program.getProgramDiagnostics(),
                    ...project.program.getGlobalDiagnostics(),
                    ...project.program.getSyntacticDiagnostics(),
                    ...project.program.getSemanticDiagnostics(),
                    ...(project.compilerOptions.declaration || project.compilerOptions.composite || project.compilerOptions.isolatedDeclarations ? project.program.getDeclarationDiagnostics() : []),
                ];
                const seen = new Set();
                for (const diagnostic of diagnostics) {
                    if (diagnostic.category !== 1)
                        continue;
                    const key = `${diagnostic.fileName}:${diagnostic.pos}:${diagnostic.code}:${diagnostic.text}`;
                    if (seen.has(key))
                        continue;
                    seen.add(key);
                    compilerErrors++;
                    const source = diagnostic.fileName === undefined ? undefined : project.program.getSourceFile(diagnostic.fileName);
                    const location = source === undefined || diagnostic.pos < 0 ? undefined : source.getLineAndCharacterOfPosition(diagnostic.pos);
                    const suffix = location === undefined ? "" : `:${location.line + 1}:${location.character + 1}`;
                    process.stderr.write(`${diagnostic.fileName ?? project.configFileName}${suffix}: TS${diagnostic.code}: ${diagnostic.text}\n`);
                }
            }
            return lintCode !== 0 || compilerErrors > 0 ? 1 : 0;
        }
        finally {
            if (checked !== opened)
                checked.close();
        }
    }
    finally {
        opened.close();
    }
};
//# sourceMappingURL=runner.js.map