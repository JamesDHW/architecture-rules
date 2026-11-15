import { realpathSync } from "node:fs";
import { checkImports } from "../analysis/imports.js";
import { inventory } from "../analysis/inventory.js";
import { openProjects } from "../analysis/projects.js";
import { checkSuppressions, listSuppressions } from "../analysis/suppressions.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { namingError } from "../rules/namingPolicy.js";
import { checkResult } from "./checkResult.js";
import { compilerFindings } from "./compilerDiagnostics.js";
import { explainFile } from "./explain.js";
import { sortFindings, structuralFinding } from "./findings.js";
import { lint } from "./oxlint.js";
import { printOutput } from "./output.js";
const isGenerated = (file) => file.policy.generated !== undefined;
/** Generated files keep their naming and import contracts; those are reported here instead of through lint. */
const generatedFileIssues = (generated, imports) => {
    const generatedPaths = new Set(generated.map((file) => file.relative));
    const namingIssues = generated.flatMap((file) => {
        const message = file.policy.naming === undefined ? undefined : namingError(file.relative, file.policy.naming);
        return message === undefined ? [] : [{ ruleId: "file-naming", file: file.relative, message }];
    });
    return [...namingIssues, ...imports.filter((issue) => generatedPaths.has(issue.file))];
};
/** The files a --file selection names, or every file; a named file outside the checked programs is an error. */
const selectFiles = (files, selection) => {
    if (selection === undefined)
        return files;
    const known = new Set(files.map((file) => file.path));
    const unknown = selection.filter((path) => !known.has(path));
    if (unknown.length > 0)
        return new ArchitectureError(unknown.map((path) => `Not a source file of the checked projects: ${path}`));
    return files.filter((file) => selection.includes(file.path));
};
const inScope = (selected, options) => {
    const selectedPaths = new Set(selected.map((file) => file.relative));
    return (finding) => options.files === undefined || selectedPaths.has(finding.file);
};
const collectFindings = async (root, opened, files, selected, options) => {
    const linted = selected.filter((file) => !isGenerated(file));
    const imports = checkImports(root, files, opened.projects);
    const generatedIssues = generatedFileIssues(selected.filter(isGenerated), imports);
    const lintFindings = await lint(root, linted, imports, opened.projects, options.fix === true);
    if (lintFindings instanceof ArchitectureError)
        return lintFindings;
    const compilerErrors = compilerFindings(root, opened.projects).filter(inScope(selected, options));
    return [...generatedIssues.map(structuralFinding), ...lintFindings, ...compilerErrors];
};
const inspectOpened = async (root, architecture, opened, options, started) => {
    const tree = inventory(root, architecture, opened.sources);
    const selected = selectFiles(tree.files, options.files);
    if (selected instanceof ArchitectureError)
        return selected;
    // Generated output is never linted, so its suppression comments (often a file-wide disable) are not checked either.
    const linted = tree.files.filter((file) => !isGenerated(file));
    const structural = [...opened.issues, ...tree.issues, ...checkSuppressions(linted, opened.projects)];
    const scope = { architecture, projects: opened.projects.length, files: selected, started };
    const suppressions = listSuppressions(selected, opened.projects);
    if (structural.length > 0)
        return checkResult(scope, sortFindings(structural.map(structuralFinding)), suppressions, false);
    const findings = await collectFindings(root, opened, tree.files, selected, options);
    if (findings instanceof ArchitectureError)
        return findings;
    return checkResult(scope, sortFindings(findings), suppressions, true);
};
const withProjects = async (root, architecture, use) => {
    const opened = openProjects(root, architecture);
    if (opened instanceof ArchitectureError)
        return opened;
    const outcome = await tryCatchAsync(async () => use(opened));
    const closed = tryCatch(opened.close);
    return afterCleanup(outcome, closed);
};
/**
 * Checks the architecture rooted at rootPath and returns every finding without printing anything:
 * structure first, then lint, then compiler diagnostics. The CLI and the language server both render this.
 */
export const inspectArchitecture = async (rootPath, architecture, options = {}) => {
    const started = performance.now();
    const root = realpathSync(rootPath);
    const result = await withProjects(root, architecture, async (opened) => inspectOpened(root, architecture, opened, options, started));
    const isFinal = options.fix !== true || result instanceof ArchitectureError;
    if (isFinal)
        return result;
    // Fixes can change imports as well as expressions. Revalidate the entire contract.
    return inspectArchitecture(rootPath, architecture, { ...options, fix: false });
};
const explain = async (root, architecture, file) => {
    return withProjects(root, architecture, async (opened) => {
        const tree = inventory(root, architecture, opened.sources);
        const linted = tree.files.filter((candidate) => !isGenerated(candidate));
        const structural = [...opened.issues, ...tree.issues, ...checkSuppressions(linted, opened.projects)];
        return explainFile(root, architecture, opened, tree, structural, file);
    });
};
/** Checks the architecture and prints the result; resolves to the process exit code. */
export const checkArchitecture = async (rootPath, architecture, options = {}) => {
    const root = realpathSync(rootPath);
    if (options.explain !== undefined)
        return explain(root, architecture, options.explain);
    const result = await inspectArchitecture(root, architecture, options);
    if (result instanceof ArchitectureError)
        return result;
    return printOutput(root, result, options.format ?? "text");
};
//# sourceMappingURL=runner.js.map