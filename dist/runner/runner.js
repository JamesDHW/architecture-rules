import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeImports } from "../analysis/imports.js";
import { inventory } from "../analysis/inventory.js";
import { openProjects } from "../analysis/projects.js";
import { exceptionMigrations, readExceptions } from "../analysis/suppressions.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { namingError } from "../rules/namingPolicy.js";
import { checkResult } from "./checkResult.js";
import { compilerFindings } from "./compilerDiagnostics.js";
import { configurationFindings, readConfig } from "./configurationFindings.js";
import { deadCode } from "./deadCode.js";
import { applyExceptions, exceptedRulesByFile } from "./exceptions.js";
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
const noManifestFinding = {
    source: "dead-code", severity: "warning", ruleId: "unused-dependencies", file: "package.json",
    message: "There is no package.json in the architecture root, so unused files, exports and dependencies were not checked.",
};
/** A --fix run is checked again afterwards; dead code is reported then. */
const unusedCode = async (root, opened, scoped, options) => {
    if (options.fix === true)
        return [];
    if (!existsSync(join(root, "package.json")))
        return [noManifestFinding];
    return deadCode(root, { architecture: scoped.architecture, files: scoped.files, projects: opened.projects, configFile: scoped.config.file });
};
const collectFindings = async (root, opened, scoped, options) => {
    const { architecture, files, selected, exceptions, config } = scoped;
    const linted = selected.filter((file) => !isGenerated(file));
    const imports = analyzeImports(root, files, opened.projects);
    const generatedIssues = generatedFileIssues(selected.filter(isGenerated), imports.issues);
    const guard = options.fix === true ? exceptedRulesByFile(exceptions) : undefined;
    const lintFindings = await lint(root, linted, imports.issues, opened.projects, guard);
    if (lintFindings instanceof ArchitectureError)
        return lintFindings;
    const compilerErrors = compilerFindings(root, opened.projects);
    const unused = await unusedCode(root, opened, scoped, options);
    if (unused instanceof ArchitectureError)
        return unused;
    const found = [...generatedIssues.map(structuralFinding), ...lintFindings, ...compilerErrors, ...unused, ...configurationFindings(root, opened, scoped, imports.uses)];
    return applyExceptions(found.filter(inScope(selected, options)), exceptions);
};
/** Structural issues, and the line exceptions of the linted files, before anything is linted. */
const structure = (opened, files, issues) => {
    // Generated output is never linted, so its exception comments (often a file-wide disable) are not checked either.
    const read = readExceptions(files.filter((file) => !isGenerated(file)), opened.projects);
    return { issues: [...opened.issues, ...issues, ...read.issues], exceptions: read.exceptions };
};
const inspectOpened = async (root, architecture, opened, options, started) => {
    const tree = inventory(root, architecture, opened.sources);
    const selected = selectFiles(tree.files, options.files);
    if (selected instanceof ArchitectureError)
        return selected;
    const checked = structure(opened, tree.files, tree.issues);
    const selectedPaths = new Set(selected.map((file) => file.relative));
    const exceptions = checked.exceptions.filter((exception) => selectedPaths.has(exception.file));
    const config = readConfig(root, options.configFile);
    const scope = { architecture, configFile: config.file, projects: opened.projects.length, files: selected, started };
    if (checked.issues.length > 0)
        return checkResult(scope, sortFindings(checked.issues.map(structuralFinding)), exceptions, false);
    const findings = await collectFindings(root, opened, { architecture, files: tree.files, selected, exceptions, config }, options);
    if (findings instanceof ArchitectureError)
        return findings;
    return checkResult(scope, sortFindings(findings), exceptions, true);
};
/** Applies non-overlapping edits to one file: the untouched text between them, with each edit's replacement. */
const applyEdits = (path, edits) => {
    const text = readFileSync(path, "utf8");
    const sorted = edits.toSorted((left, right) => left.start - right.start);
    const previousEnd = (index) => (index === 0 ? 0 : sorted.at(index - 1)?.end ?? 0);
    const pieces = sorted.flatMap((edit, index) => [text.slice(previousEnd(index), edit.start), edit.replacement]);
    writeFileSync(path, [...pieces, text.slice(sorted.at(-1)?.end ?? 0)].join(""));
};
/** --fix converts reasoned engine disable comments into exceptions before anything else is checked. */
const migrateExceptions = async (root, architecture, opened) => {
    const tree = inventory(root, architecture, opened.sources);
    const edits = exceptionMigrations(tree.files.filter((file) => !isGenerated(file)), opened.projects);
    for (const [path, fileEdits] of Map.groupBy(edits, (edit) => edit.path)) {
        applyEdits(path, fileEdits);
    }
    return edits.length;
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
    if (options.fix === true) {
        const migrated = await withProjects(root, architecture, async (opened) => migrateExceptions(root, architecture, opened));
        if (migrated instanceof ArchitectureError)
            return migrated;
    }
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
        return explainFile(root, architecture, opened, tree, structure(opened, tree.files, tree.issues).issues, file);
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