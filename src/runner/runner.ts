import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ConfigText } from "../analysis/configurationChecks.js";
import { analyzeImports, type ImportIssue } from "../analysis/imports.js";
import { inventory, type ClassifiedFile, type Issue } from "../analysis/inventory.js";
import { openProjects, type Projects } from "../analysis/projects.js";
import { exceptionMigrations, readExceptions, type LineException, type SourceEdit } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { namingError } from "../rules/namingPolicy.js";
import { checkResult, type CheckResult, type CheckScope } from "./checkResult.js";
import { compilerFindings } from "./compilerDiagnostics.js";
import { configurationFindings, readConfig } from "./configurationFindings.js";
import { deadCode } from "./deadCode.js";
import { applyExceptions, exceptedRulesByFile } from "./exceptions.js";
import { explainFile } from "./explain.js";
import { sortFindings, structuralFinding, type Finding } from "./findings.js";
import { lint } from "./oxlint.js";
import { printOutput, type OutputFormat } from "./output.js";

export type InspectOptions = {
  readonly fix?: boolean;
  /** Absolute paths: lint and report only these files. The whole project is still analyzed. */
  readonly files?: readonly string[];
  /** The architecture configuration's path, for findings about it; architecture.config.ts in the root by default. */
  readonly configFile?: string;
};

export type CheckOptions = InspectOptions & { readonly explain?: string; readonly format?: OutputFormat };

const isGenerated = (file: ClassifiedFile): boolean => file.policy.generated !== undefined;

/** Generated files keep their naming and import contracts; those are reported here instead of through lint. */
const generatedFileIssues = (generated: readonly ClassifiedFile[], imports: readonly ImportIssue[]): readonly Issue[] => {
  const generatedPaths = new Set(generated.map((file) => file.relative));
  const namingIssues = generated.flatMap((file) => {
    const message = file.policy.naming === undefined ? undefined : namingError(file.relative, file.policy.naming);
    return message === undefined ? [] : [{ ruleId: "file-naming", file: file.relative, message }];
  });
  return [...namingIssues, ...imports.filter((issue) => generatedPaths.has(issue.file))];
};

/** The files a --file selection names, or every file; a named file outside the checked programs is an error. */
const selectFiles = (files: readonly ClassifiedFile[], selection: readonly string[] | undefined): readonly ClassifiedFile[] | ArchitectureError => {
  if (selection === undefined) return files;
  const known = new Set(files.map((file) => file.path));
  const unknown = selection.filter((path) => !known.has(path));
  if (unknown.length > 0) return new ArchitectureError(unknown.map((path) => `Not a source file of the checked projects: ${path}`));
  return files.filter((file) => selection.includes(file.path));
};

const inScope = (selected: readonly ClassifiedFile[], options: InspectOptions) => {
  const selectedPaths = new Set(selected.map((file) => file.relative));
  return (finding: Finding): boolean => options.files === undefined || selectedPaths.has(finding.file);
};

type Scoped = {
  readonly architecture: Architecture;
  readonly files: readonly ClassifiedFile[];
  readonly selected: readonly ClassifiedFile[];
  readonly exceptions: readonly LineException[];
  readonly config: ConfigText;
};

const noManifestFinding: Finding = {
  source: "dead-code", severity: "warning", ruleId: "unused-dependencies", file: "package.json",
  message: "There is no package.json in the architecture root, so unused files, exports and dependencies were not checked.",
};

/** A --fix run is checked again afterwards; dead code is reported then. */
const unusedCode = async (root: string, opened: Projects, scoped: Scoped, options: InspectOptions): Promise<readonly Finding[] | ArchitectureError> => {
  if (options.fix === true) return [];
  if (!existsSync(join(root, "package.json"))) return [noManifestFinding];
  return deadCode(root, { architecture: scoped.architecture, files: scoped.files, projects: opened.projects, configFile: scoped.config.file });
};

const collectFindings = async (root: string, opened: Projects, scoped: Scoped, options: InspectOptions): Promise<readonly Finding[] | ArchitectureError> => {
  const { architecture, files, selected, exceptions, config } = scoped;
  const linted = selected.filter((file) => !isGenerated(file));
  const imports = analyzeImports(root, files, opened.projects);
  const generatedIssues = generatedFileIssues(selected.filter(isGenerated), imports.issues);
  const guard = options.fix === true ? exceptedRulesByFile(exceptions) : undefined;
  const lintFindings = await lint(root, linted, imports.issues, opened.projects, guard);
  if (lintFindings instanceof ArchitectureError) return lintFindings;
  const compilerErrors = compilerFindings(root, opened.projects);
  const unused = await unusedCode(root, opened, scoped, options);
  if (unused instanceof ArchitectureError) return unused;
  const found = [...generatedIssues.map(structuralFinding), ...lintFindings, ...compilerErrors, ...unused, ...configurationFindings(root, opened, scoped, imports.uses)];
  return applyExceptions(found.filter(inScope(selected, options)), exceptions);
};

/** Structural issues, and the line exceptions of the linted files, before anything is linted. */
const structure = (opened: Projects, files: readonly ClassifiedFile[], issues: readonly Issue[]) => {
  // Generated output is never linted, so its exception comments (often a file-wide disable) are not checked either.
  const read = readExceptions(files.filter((file) => !isGenerated(file)), opened.projects);
  return { issues: [...opened.issues, ...issues, ...read.issues], exceptions: read.exceptions };
};

const inspectOpened = async (
  root: string, architecture: Architecture, opened: Projects, options: InspectOptions, started: number,
): Promise<CheckResult | ArchitectureError> => {
  const tree = inventory(root, architecture, opened.sources);
  const selected = selectFiles(tree.files, options.files);
  if (selected instanceof ArchitectureError) return selected;
  const checked = structure(opened, tree.files, tree.issues);
  const selectedPaths = new Set(selected.map((file) => file.relative));
  const exceptions = checked.exceptions.filter((exception) => selectedPaths.has(exception.file));
  const config = readConfig(root, options.configFile);
  const scope: CheckScope = { architecture, configFile: config.file, projects: opened.projects.length, files: selected, started };
  if (checked.issues.length > 0) return checkResult(scope, sortFindings(checked.issues.map(structuralFinding)), exceptions, false);
  const findings = await collectFindings(root, opened, { architecture, files: tree.files, selected, exceptions, config }, options);
  if (findings instanceof ArchitectureError) return findings;
  return checkResult(scope, sortFindings(findings), exceptions, true);
};

/** Applies non-overlapping edits to one file: the untouched text between them, with each edit's replacement. */
const applyEdits = (path: string, edits: readonly SourceEdit[]): void => {
  const text = readFileSync(path, "utf8");
  const sorted = edits.toSorted((left, right) => left.start - right.start);
  const previousEnd = (index: number): number => (index === 0 ? 0 : sorted.at(index - 1)?.end ?? 0);
  const pieces = sorted.flatMap((edit, index) => [text.slice(previousEnd(index), edit.start), edit.replacement]);
  writeFileSync(path, [...pieces, text.slice(sorted.at(-1)?.end ?? 0)].join(""));
};

/** --fix converts reasoned engine disable comments into exceptions before anything else is checked. */
const migrateExceptions = async (root: string, architecture: Architecture, opened: Projects): Promise<number> => {
  const tree = inventory(root, architecture, opened.sources);
  const edits = exceptionMigrations(tree.files.filter((file) => !isGenerated(file)), opened.projects);
  for (const [path, fileEdits] of Map.groupBy(edits, (edit) => edit.path)) {
    applyEdits(path, fileEdits);
  }
  return edits.length;
};

const withProjects = async <Result>(
  root: string, architecture: Architecture, use: (opened: Projects) => Promise<Result | ArchitectureError>,
): Promise<Result | ArchitectureError> => {
  const opened = openProjects(root, architecture);
  if (opened instanceof ArchitectureError) return opened;
  const outcome = await tryCatchAsync(async () => use(opened));
  const closed = tryCatch(opened.close);
  return afterCleanup(outcome, closed);
};

/**
 * Checks the architecture rooted at rootPath and returns every finding without printing anything:
 * structure first, then lint, then compiler diagnostics. The CLI and the language server both render this.
 */
export const inspectArchitecture = async (rootPath: string, architecture: Architecture, options: InspectOptions = {}): Promise<CheckResult | ArchitectureError> => {
  const started = performance.now();
  const root = realpathSync(rootPath);
  if (options.fix === true) {
    const migrated = await withProjects(root, architecture, async (opened) => migrateExceptions(root, architecture, opened));
    if (migrated instanceof ArchitectureError) return migrated;
  }
  const result = await withProjects(root, architecture, async (opened) => inspectOpened(root, architecture, opened, options, started));
  const isFinal = options.fix !== true || result instanceof ArchitectureError;
  if (isFinal) return result;
  // Fixes can change imports as well as expressions. Revalidate the entire contract.
  return inspectArchitecture(rootPath, architecture, { ...options, fix: false });
};

const explain = async (root: string, architecture: Architecture, file: string): Promise<number | ArchitectureError> => {
  return withProjects(root, architecture, async (opened) => {
    const tree = inventory(root, architecture, opened.sources);
    return explainFile(root, architecture, opened, tree, structure(opened, tree.files, tree.issues).issues, file);
  });
};

/** Checks the architecture and prints the result; resolves to the process exit code. */
export const checkArchitecture = async (rootPath: string, architecture: Architecture, options: CheckOptions = {}): Promise<number | ArchitectureError> => {
  const root = realpathSync(rootPath);
  if (options.explain !== undefined) return explain(root, architecture, options.explain);
  const result = await inspectArchitecture(root, architecture, options);
  if (result instanceof ArchitectureError) return result;
  return printOutput(root, result, options.format ?? "text");
};
