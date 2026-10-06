import { realpathSync } from "node:fs";

import { checkImports, type ImportIssue } from "../analysis/imports.js";
import { inventory, type ClassifiedFile, type Issue } from "../analysis/inventory.js";
import { openProjects, type Projects } from "../analysis/projects.js";
import { checkSuppressions } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";
import { namingError } from "../rules/namingPolicy.js";
import { reportCompilerErrors } from "./compilerDiagnostics.js";
import { explainFile } from "./explain.js";
import { lint } from "./oxlint.js";
import { printIssues } from "./report.js";

export type CheckOptions = { readonly fix?: boolean; readonly explain?: string };

const isGenerated = (file: ClassifiedFile): boolean => file.policy.generated !== undefined;

/** Generated files keep their naming and import contracts; those are reported here instead of through Oxlint. */
const generatedFileIssues = (generated: readonly ClassifiedFile[], imports: readonly ImportIssue[]): readonly Issue[] => {
  const generatedPaths = new Set(generated.map((file) => file.relative));
  const namingIssues = generated.flatMap((file) => {
    const message = file.policy.naming === undefined ? undefined : namingError(file.relative, file.policy.naming);
    return message === undefined ? [] : [{ ruleId: "file-naming", file: file.relative, message }];
  });
  return [...namingIssues, ...imports.filter((issue) => generatedPaths.has(issue.file))];
};

const runChecks = async (root: string, architecture: Architecture, opened: Projects, options: CheckOptions): Promise<number | ArchitectureError> => {
  const tree = inventory(root, architecture, opened.sources);
  // Generated output is never linted, so its suppression comments (often a file-wide disable) are not checked either.
  const linted = tree.files.filter((file) => !isGenerated(file));
  const structural = [...opened.issues, ...tree.issues, ...checkSuppressions(linted, opened.projects)];
  if (options.explain !== undefined) return explainFile(root, architecture, opened, tree, structural, options.explain);
  if (structural.length > 0) {
    printIssues(structural);
    return 1;
  }
  const imports = checkImports(root, tree.files, opened.projects);
  const generatedIssues = generatedFileIssues(tree.files.filter(isGenerated), imports);
  printIssues(generatedIssues);
  const lintCode = await lint(root, linted, imports, opened.projects, options.fix === true);
  if (lintCode instanceof ArchitectureError) return lintCode;
  // Fixes can change imports as well as expressions. Revalidate the entire contract.
  if (options.fix === true) return checkArchitecture(root, architecture);
  const compilerErrors = reportCompilerErrors(opened.projects);
  const failed = generatedIssues.length > 0 || lintCode !== 0 || compilerErrors > 0;
  return failed ? 1 : 0;
};

/** Checks the architecture rooted at root: structure first, then lint, then compiler diagnostics. */
export const checkArchitecture = async (rootPath: string, architecture: Architecture, options: CheckOptions = {}): Promise<number | ArchitectureError> => {
  const root = realpathSync(rootPath);
  const opened = openProjects(root, architecture);
  if (opened instanceof ArchitectureError) return opened;
  const outcome = await tryCatchAsync(async () => runChecks(root, architecture, opened, options));
  const closed = tryCatch(opened.close);
  return afterCleanup(outcome, closed);
};
