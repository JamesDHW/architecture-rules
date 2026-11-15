import { realpathSync } from "node:fs";

import { checkImports, type ImportIssue } from "../analysis/imports.js";
import { inventory, type ClassifiedFile, type Issue } from "../analysis/inventory.js";
import { openProjects, type Projects } from "../analysis/projects.js";
import { checkSuppressions, listSuppressions } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { namingError } from "../rules/namingPolicy.js";
import { checkResult, type CheckResult, type CheckScope } from "./checkResult.js";
import { compilerFindings } from "./compilerDiagnostics.js";
import { explainFile } from "./explain.js";
import { sortFindings, structuralFinding, type Finding } from "./findings.js";
import { lint } from "./oxlint.js";
import { printOutput, type OutputFormat } from "./output.js";

export type { CheckResult } from "./checkResult.js";

export type InspectOptions = {
  readonly fix?: boolean;
  /** Absolute paths: lint and report only these files. The whole project is still analyzed. */
  readonly files?: readonly string[];
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

const collectFindings = async (
  root: string, opened: Projects, files: readonly ClassifiedFile[], selected: readonly ClassifiedFile[], options: InspectOptions,
): Promise<readonly Finding[] | ArchitectureError> => {
  const linted = selected.filter((file) => !isGenerated(file));
  const imports = checkImports(root, files, opened.projects);
  const generatedIssues = generatedFileIssues(selected.filter(isGenerated), imports);
  const lintFindings = await lint(root, linted, imports, opened.projects, options.fix === true);
  if (lintFindings instanceof ArchitectureError) return lintFindings;
  const compilerErrors = compilerFindings(root, opened.projects).filter(inScope(selected, options));
  return [...generatedIssues.map(structuralFinding), ...lintFindings, ...compilerErrors];
};

const inspectOpened = async (
  root: string, architecture: Architecture, opened: Projects, options: InspectOptions, started: number,
): Promise<CheckResult | ArchitectureError> => {
  const tree = inventory(root, architecture, opened.sources);
  const selected = selectFiles(tree.files, options.files);
  if (selected instanceof ArchitectureError) return selected;
  // Generated output is never linted, so its suppression comments (often a file-wide disable) are not checked either.
  const linted = tree.files.filter((file) => !isGenerated(file));
  const structural = [...opened.issues, ...tree.issues, ...checkSuppressions(linted, opened.projects)];
  const scope: CheckScope = { architecture, projects: opened.projects.length, files: selected, started };
  const suppressions = listSuppressions(selected, opened.projects);
  if (structural.length > 0) return checkResult(scope, sortFindings(structural.map(structuralFinding)), suppressions, false);
  const findings = await collectFindings(root, opened, tree.files, selected, options);
  if (findings instanceof ArchitectureError) return findings;
  return checkResult(scope, sortFindings(findings), suppressions, true);
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
  const result = await withProjects(root, architecture, async (opened) => inspectOpened(root, architecture, opened, options, started));
  const isFinal = options.fix !== true || result instanceof ArchitectureError;
  if (isFinal) return result;
  // Fixes can change imports as well as expressions. Revalidate the entire contract.
  return inspectArchitecture(rootPath, architecture, { ...options, fix: false });
};

const explain = async (root: string, architecture: Architecture, file: string): Promise<number | ArchitectureError> => {
  return withProjects(root, architecture, async (opened) => {
    const tree = inventory(root, architecture, opened.sources);
    const linted = tree.files.filter((candidate) => !isGenerated(candidate));
    const structural = [...opened.issues, ...tree.issues, ...checkSuppressions(linted, opened.projects)];
    return explainFile(root, architecture, opened, tree, structural, file);
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
