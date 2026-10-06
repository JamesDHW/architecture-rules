import type { Diagnostic, Project } from "typescript/unstable/sync";

import { relativePath } from "../analysis/paths.js";
import type { Finding } from "./findings.js";

/** TypeScript's DiagnosticCategory.Error. */
const errorCategory = 1;

const emitsDeclarations = ({ compilerOptions }: Project): boolean => {
  return compilerOptions.declaration === true || compilerOptions.composite === true || compilerOptions.isolatedDeclarations === true;
};

const projectDiagnostics = (project: Project): readonly Diagnostic[] => {
  const { program } = project;
  return [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getProgramDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...(emitsDeclarations(project) ? program.getDeclarationDiagnostics() : []),
  ];
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
const projectErrors = (root: string, project: Project): readonly Finding[] => {
  const errors = projectDiagnostics(project)
    .filter((diagnostic) => diagnostic.category === errorCategory)
    .map((diagnostic) => [`${diagnostic.fileName}:${diagnostic.pos}:${diagnostic.code}:${diagnostic.text}`, toFinding(root, project, diagnostic)] as const);
  return [...new Map(errors).values()];
};

/** Every compiler error in the projects, as findings. */
export const compilerFindings = (root: string, projects: readonly Project[]): readonly Finding[] => {
  return projects.flatMap((project) => projectErrors(root, project));
};
