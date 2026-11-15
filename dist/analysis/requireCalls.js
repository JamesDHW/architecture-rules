import { isCallExpression, isIdentifier, isImportDeclaration, isStringLiteral, isVariableDeclaration, SyntaxKind, } from "typescript/unstable/ast";
import { infrastructure } from "./paths.js";
const nodeModuleSpecifiers = ["node:module", "module"];
/** Walks up from a declaration to the import that brought its value in, when there is one. */
const isNodeModuleImport = (node) => {
    if (node === undefined)
        return false;
    if (isImportDeclaration(node))
        return isStringLiteral(node.moduleSpecifier) && nodeModuleSpecifiers.includes(node.moduleSpecifier.text);
    return node.kind !== SyntaxKind.SourceFile && isNodeModuleImport(node.parent);
};
const isVariable = (node) => node !== undefined && isVariableDeclaration(node);
const isCall = (node) => node !== undefined && isCallExpression(node);
/** The function a declaration's initializer calls, when it is a call of a plain identifier. */
const initializerFactory = (declaration) => {
    const initializer = isVariable(declaration) ? declaration.initializer : undefined;
    if (!isCall(initializer))
        return undefined;
    return isIdentifier(initializer.expression) ? initializer.expression : undefined;
};
/** A local require created with createRequire from node:module loads modules like the global one. */
const isCreatedRequire = (project, declaration) => {
    const factory = initializerFactory(declaration);
    if (factory === undefined)
        return false;
    return project.checker.getSymbolAtLocation(factory)?.declarations.some((handle) => isNodeModuleImport(handle.resolve(project))) ?? false;
};
/** A call of require, or of a require created with createRequire, loads a module. */
export const isModuleRequire = (project, call) => {
    const callee = call.expression;
    const callsRequire = isIdentifier(callee) && callee.text === "require";
    if (!callsRequire)
        return false;
    const localDefinitions = project.checker.getSymbolAtLocation(callee)?.declarations.filter((declaration) => !infrastructure(declaration.path)) ?? [];
    return localDefinitions.length === 0 || localDefinitions.some((declaration) => isCreatedRequire(project, declaration.resolve(project)));
};
//# sourceMappingURL=requireCalls.js.map