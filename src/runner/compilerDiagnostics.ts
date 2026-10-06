import type { Diagnostic, Project } from "typescript/unstable/sync";

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

const location = (project: Project, diagnostic: Diagnostic): string => {
  const source = diagnostic.fileName === undefined ? undefined : project.program.getSourceFile(diagnostic.fileName);
  const hasPosition = source !== undefined && diagnostic.pos >= 0;
  if (!hasPosition) return "";
  const { line, character } = source.getLineAndCharacterOfPosition(diagnostic.pos);
  return `:${line + 1}:${character + 1}`;
};

const formatDiagnostic = (project: Project, diagnostic: Diagnostic): string => {
  return `${diagnostic.fileName ?? project.configFileName}${location(project, diagnostic)}: TS${diagnostic.code}: ${diagnostic.text}`;
};

/** Each project's distinct compiler errors, formatted for output. */
const projectErrors = (project: Project): readonly string[] => {
  const errors = projectDiagnostics(project)
    .filter((diagnostic) => diagnostic.category === errorCategory)
    .map((diagnostic) => [`${diagnostic.fileName}:${diagnostic.pos}:${diagnostic.code}:${diagnostic.text}`, formatDiagnostic(project, diagnostic)] as const);
  return [...new Map(errors).values()];
};

/** Prints every compiler error and returns how many there were. */
export const reportCompilerErrors = (projects: readonly Project[]): number => {
  const errors = projects.flatMap(projectErrors);
  for (const error of errors) {
    process.stderr.write(`${error}\n`);
  }
  return errors.length;
};
