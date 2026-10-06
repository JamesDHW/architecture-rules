import { relativePath } from "../analysis/paths.js";
/** TypeScript's DiagnosticCategory.Error. */
const errorCategory = 1;
const emitsDeclarations = ({ compilerOptions }) => {
    return compilerOptions.declaration === true || compilerOptions.composite === true || compilerOptions.isolatedDeclarations === true;
};
const projectDiagnostics = (project) => {
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
const position = (project, diagnostic) => {
    const source = diagnostic.fileName === undefined ? undefined : project.program.getSourceFile(diagnostic.fileName);
    const hasPosition = source !== undefined && diagnostic.pos >= 0;
    if (!hasPosition)
        return {};
    const { line, character } = source.getLineAndCharacterOfPosition(diagnostic.pos);
    return { line: line + 1, column: character + 1 };
};
const toFinding = (root, project, diagnostic) => ({
    source: "compiler",
    severity: "error",
    ruleId: `TS${diagnostic.code}`,
    file: relativePath(root, diagnostic.fileName ?? project.configFileName),
    ...position(project, diagnostic),
    message: diagnostic.text,
});
/** Each project's distinct compiler errors. */
const projectErrors = (root, project) => {
    const errors = projectDiagnostics(project)
        .filter((diagnostic) => diagnostic.category === errorCategory)
        .map((diagnostic) => [`${diagnostic.fileName}:${diagnostic.pos}:${diagnostic.code}:${diagnostic.text}`, toFinding(root, project, diagnostic)]);
    return [...new Map(errors).values()];
};
/** Every compiler error in the projects, as findings. */
export const compilerFindings = (root, projects) => {
    return projects.flatMap((project) => projectErrors(root, project));
};
//# sourceMappingURL=compilerDiagnostics.js.map