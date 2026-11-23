import { realpathSync } from "node:fs";

import type { ConfigText } from "../analysis/configurationChecks.js";
import { analyzeImports, type ImportAnalysis, type ImportIssue } from "../analysis/imports.js";
import { inventory, type ClassifiedFile, type Issue } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import { readExceptions, type LineException } from "../analysis/suppressions.js";
import { workspacesOf } from "../analysis/workspaces.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";

import { namingError } from "../rules/namingPolicy.js";
import { checkResult, hasErrors, type CheckResult, type CheckScope } from "./checkResult.js";
import { configurationFindings, readConfig } from "./configurationFindings.js";
import { applyExceptions, exceptedRulesByFile } from "./exceptions.js";
import { explainFile } from "./explain.js";
import { sortFindings, structuralFinding, type Finding } from "./findings.js";
import { migrateExceptions } from "./migrateExceptions.js";
import { glossaryFindings } from "./glossaryFindings.js";
import { lint } from "./oxlint.js";
import { programFindings } from "./programFindings.js";
import { cacheKeys } from "./cacheKeys.js";
import { compilerStage, deadCodeStage, type Cache } from "./cachedStages.js";
import { entriesFor, readCache, splitByCache, writeCache } from "./checkCache.js";
import { withProjects } from "./withProjects.js";
import { renderOutput, type OutputFormat } from "./output.js";

export type InspectOptions = {
  readonly fix?: boolean;
  /** Absolute paths: lint and report only these files. The whole project is still analyzed. */
  readonly files?: readonly string[];
  /** The architecture configuration's path, for findings about it; architecture.config.ts in the root by default. */
  readonly configFile?: string;
  /** Drop selected files that are not source of the checked programs instead of failing: an agent hook passes any edited file. */
  readonly ignoreUnknownFiles?: boolean;
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
const selectFiles = (files: readonly ClassifiedFile[], selection: readonly string[] | undefined, ignoreUnknown: boolean): readonly ClassifiedFile[] | ArchitectureError => {
  if (selection === undefined) return files;
  const known = new Set(files.map((file) => file.path));
  const unknown = selection.filter((path) => !known.has(path));
  const isRejected = unknown.length > 0 && !ignoreUnknown;
  if (isRejected) return new ArchitectureError(unknown.map((path) => `Not a source file of the checked projects: ${path}`));
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

/** A --fix run is checked again afterwards; dead code is reported then. */
const unusedCode = async (root: string, opened: Projects, scoped: Scoped, cache: Cache | undefined): Promise<readonly Finding[] | ArchitectureError> => {
  if (cache === undefined) return [];
  return deadCodeStage(root, { architecture: scoped.architecture, files: scoped.files, projects: opened.projects, configFile: scoped.config.file }, cache);
};

type Collected = { readonly findings: readonly Finding[]; readonly imports: ImportAnalysis };

const collectFindings = async (root: string, opened: Projects, scoped: Scoped, options: InspectOptions): Promise<Collected | ArchitectureError> => {
  const { architecture, files, selected, exceptions, config } = scoped;
  const linted = selected.filter((file) => !isGenerated(file));
  const imports = analyzeImports(root, files, opened.projects);
  const generatedIssues = generatedFileIssues(selected.filter(isGenerated), imports.issues);
  const guard = options.fix === true ? exceptedRulesByFile(exceptions) : undefined;
  const cache = options.fix === true ? undefined : { contents: readCache(root), keys: cacheKeys(root, architecture, opened, files, imports, workspacesOf(root, files)) };
  const lintSplit = cache === undefined ? { stale: linted, cached: [] } : splitByCache(linted, cache.contents.lint, cache.keys);
  const lintResult = await lint(root, lintSplit.stale, imports.issues, opened.projects, guard);
  if (lintResult instanceof ArchitectureError) return lintResult;
  // Glossary findings about names are cached with the file's lint findings: both depend on the file and what it imports.
  const glossary = glossaryFindings({ architecture, opened, files, checked: lintSplit.stale, config });
  const linting = [...lintResult, ...glossary.names];
  const lintFindings = [...lintSplit.cached, ...linting];
  const compiled = compilerStage(root, opened, files, cache);
  const unused = await unusedCode(root, opened, scoped, cache);
  if (unused instanceof ArchitectureError) return unused;
  if (cache !== undefined) {
    writeCache(root, {
      // Every lintable file, not only a --file selection: the others keep their cached entries.
      lint: entriesFor(files.filter((file) => !isGenerated(file)), linting, cache.keys, cache.contents.lint, lintSplit.stale),
      compiler: compiled.entries,
      deadCode: { key: cache.keys.programKey, findings: unused },
    });
  }
  const compilerErrors = compiled.findings;
  const program = programFindings({ architecture, files, selected: linted, projects: opened.projects, imports });
  const found = [
    ...generatedIssues.map(structuralFinding), ...lintFindings, ...compilerErrors, ...program, ...unused,
    ...configurationFindings(root, opened, scoped, imports.uses), ...glossary.configuration,
  ];
  return { findings: applyExceptions(found.filter(inScope(selected, options)), exceptions), imports };
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
  const selected = selectFiles(tree.files, options.files, options.ignoreUnknownFiles === true);
  if (selected instanceof ArchitectureError) return selected;
  const checked = structure(opened, tree.files, tree.issues);
  const selectedPaths = new Set(selected.map((file) => file.relative));
  const exceptions = checked.exceptions.filter((exception) => selectedPaths.has(exception.file));
  const config = readConfig(root, options.configFile);
  const scope: CheckScope = {
    architecture, configFile: config.file, projects: opened.projects.length, files: selected,
    workspaces: workspacesOf(root, tree.files), partial: options.files !== undefined, started,
  };
  if (checked.issues.length > 0) return checkResult(scope, sortFindings(checked.issues.map(structuralFinding)), exceptions, undefined);
  const collected = await collectFindings(root, opened, { architecture, files: tree.files, selected, exceptions, config }, options);
  if (collected instanceof ArchitectureError) return collected;
  return checkResult(scope, sortFindings(collected.findings), exceptions, collected.imports);
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
  const format = options.format ?? "text";
  process.stdout.write(renderOutput(root, result, format));
  const isFailure = format !== "report" && hasErrors(result);
  return isFailure ? 1 : 0;
};
