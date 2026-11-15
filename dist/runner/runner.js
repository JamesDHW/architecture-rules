import { realpathSync } from "node:fs";
import { checkImports } from "../analysis/imports.js";
import { inventory } from "../analysis/inventory.js";
import { openProjects } from "../analysis/projects.js";
import { checkSuppressions, listSuppressions } from "../analysis/suppressions.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { namingError } from "../rules/namingPolicy.js";
import { compilerFindings } from "./compilerDiagnostics.js";
import { explainFile } from "./explain.js";
import { isError, structuralFinding } from "./findings.js";
import { renderReport } from "./markdownReport.js";
import { lint } from "./oxlint.js";
import { guidanceFor } from "./ruleGuidance.js";
import { printJson, printText } from "./textOutput.js";
const isGenerated = (file) => file.policy.generated !== undefined;
/** Generated files keep their naming and import contracts; those are reported here instead of through Oxlint. */
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
const collectFindings = async (root, architecture, opened, files, options) => {
    const selected = selectFiles(files, options.files);
    if (selected instanceof ArchitectureError)
        return selected;
    const linted = selected.filter((file) => !isGenerated(file));
    const selectedPaths = new Set(selected.map((file) => file.relative));
    const imports = checkImports(root, files, opened.projects);
    const generatedIssues = generatedFileIssues(selected.filter(isGenerated), imports);
    const lintFindings = await lint(root, linted, imports, opened.projects, options.fix === true);
    if (lintFindings instanceof ArchitectureError)
        return lintFindings;
    const compilerErrors = compilerFindings(root, opened.projects).filter((finding) => options.files === undefined || selectedPaths.has(finding.file));
    return { findings: [...generatedIssues.map(structuralFinding), ...lintFindings, ...compilerErrors], files: selected };
};
const output = (root, architecture, opened, collected, options) => {
    const { findings, files } = collected;
    const format = options.format ?? "text";
    switch (format) {
        case "report":
            process.stdout.write(renderReport({ architecture, files, findings, suppressions: listSuppressions(files, opened.projects) }));
            return 0;
        case "json":
            printJson(findings, guidanceFor(root, findings));
            return findings.some(isError) ? 1 : 0;
        case "text":
            printText(findings, guidanceFor(root, findings));
            return findings.some(isError) ? 1 : 0;
    }
};
const runChecks = async (root, architecture, opened, options) => {
    const tree = inventory(root, architecture, opened.sources);
    // Generated output is never linted, so its suppression comments (often a file-wide disable) are not checked either.
    const linted = tree.files.filter((file) => !isGenerated(file));
    const structural = [...opened.issues, ...tree.issues, ...checkSuppressions(linted, opened.projects)];
    if (options.explain !== undefined)
        return explainFile(root, architecture, opened, tree, structural, options.explain);
    if (structural.length > 0)
        return output(root, architecture, opened, { findings: structural.map(structuralFinding), files: tree.files }, options);
    const collected = await collectFindings(root, architecture, opened, tree.files, options);
    if (collected instanceof ArchitectureError)
        return collected;
    // Fixes can change imports as well as expressions. Revalidate the entire contract.
    if (options.fix === true)
        return checkArchitecture(root, architecture, { ...options, fix: false });
    return output(root, architecture, opened, collected, options);
};
/** Checks the architecture rooted at root: structure first, then lint, then compiler diagnostics. */
export const checkArchitecture = async (rootPath, architecture, options = {}) => {
    const root = realpathSync(rootPath);
    const opened = openProjects(root, architecture);
    if (opened instanceof ArchitectureError)
        return opened;
    const outcome = await tryCatchAsync(async () => runChecks(root, architecture, opened, options));
    const closed = tryCatch(opened.close);
    return afterCleanup(outcome, closed);
};
//# sourceMappingURL=runner.js.map