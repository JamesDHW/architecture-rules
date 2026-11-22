import type { Diagnostic, Project } from "typescript/unstable/sync";

import { relativePath } from "../analysis/paths.js";
import type { Finding } from "./findings.js";

/** TypeScript's DiagnosticCategory.Error. */
const errorCategory = 1;

const emitsDeclarations = ({ compilerOptions }: Project): boolean => {
  return compilerOptions.declaration === true || compilerOptions.composite === true || compilerOptions.isolatedDeclarations === true;
};

/** Diagnostics that belong to no one source file: the configuration's, the options' and global ones. */
const programDiagnostics = ({ program }: Project): readonly Diagnostic[] => [
  ...program.getConfigFileParsingDiagnostics(),
  ...program.getProgramDiagnostics(),
  ...program.getGlobalDiagnostics(),
];

/** A file's diagnostics, or every file's when no file is named. */
const fileDiagnostics = (project: Project, file?: string): readonly Diagnostic[] => {
  const { program } = project;
  return [
    ...program.getSyntacticDiagnostics(file),
    ...program.getSemanticDiagnostics(file),
    ...(emitsDeclarations(project) ? program.getDeclarationDiagnostics(file) : []),
  ];
};

const sourceDiagnostics = (project: Project, only: ReadonlySet<string> | undefined): readonly Diagnostic[] => {
  if (only === undefined) return fileDiagnostics(project);
  const files = [...only].filter((path) => project.program.getSourceFile(path) !== undefined);
  return files.flatMap((path) => fileDiagnostics(project, path));
};

const position = (project: Project, diagnostic: Diagnostic): { readonly line?: number; readonly column?: number } => {
  const source = diagnostic.fileName === undefined ? undefined : project.program.getSourceFile(diagnostic.fileName);
  const hasPosition = source !== undefined && diagnostic.pos >= 0;
  if (!hasPosition) return {};
  const { line, character } = source.getLineAndCharacterOfPosition(diagnostic.pos);
  return { line: line + 1, column: character + 1 };
};

const toFinding = (root: string, project: Project, diagnostic: Diagnostic): Finding => ({
  source: "compiler",
  severity: "error",
  ruleId: `TS${diagnostic.code}`,
  file: relativePath(root, diagnostic.fileName ?? project.configFileName),
  ...position(project, diagnostic),
  message: diagnostic.text,
});

/** Each project's distinct compiler errors. */
const projectErrors = (root: string, project: Project, diagnostics: readonly Diagnostic[]): readonly Finding[] => {
  const errors = diagnostics
    .filter((diagnostic) => diagnostic.category === errorCategory)
    .map((diagnostic) => [`${diagnostic.fileName}:${diagnostic.pos}:${diagnostic.code}:${diagnostic.text}`, toFinding(root, project, diagnostic)] as const);
  return [...new Map(errors).values()];
};

/** Every compiler error in the projects, as findings. */
export const compilerFindings = (root: string, projects: readonly Project[]): readonly Finding[] => {
  return projects.flatMap((project) => projectErrors(root, project, [...programDiagnostics(project), ...fileDiagnostics(project)]));
};

/**
 * The errors that belong to no one file: configuration, options and global ones. Global diagnostics check the whole
 * program, so a check with a cache asks for them only when something global changed.
 */
export const programFindings = (root: string, projects: readonly Project[]): readonly Finding[] => {
  return projects.flatMap((project) => projectErrors(root, project, programDiagnostics(project)));
};

/** The errors of source files: every file's, or only the named ones' (absolute paths). */
export const sourceFindings = (root: string, projects: readonly Project[], only?: ReadonlySet<string>): readonly Finding[] => {
  return projects.flatMap((project) => projectErrors(root, project, sourceDiagnostics(project, only)));
};
