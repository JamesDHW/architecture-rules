import { basename } from "node:path";
import { computeLineStarts, isArrowFunction, isBindingElement, isClassDeclaration, isClassExpression, isEnumDeclaration, isFunctionDeclaration, isFunctionExpression, isGetAccessorDeclaration, isIdentifier, isInterfaceDeclaration, isMethodDeclaration, isMethodSignatureDeclaration, isParameterDeclaration, isPropertyDeclaration, isPropertySignatureDeclaration, isSetAccessorDeclaration, isTypeAliasDeclaration, isVariableDeclaration, SyntaxKind, } from "typescript/unstable/ast";
import { descendants } from "./syntaxTree.js";
const isOverride = (node) => node.modifiers?.some((modifier) => modifier.kind === SyntaxKind.OverrideKeyword) === true;
const isFunctionValue = (node) => {
    if (node === undefined)
        return false;
    return isArrowFunction(node) || isFunctionExpression(node) || isClassExpression(node);
};
const isInObjectLiteral = (node) => node.parent.kind === SyntaxKind.ObjectLiteralExpression;
const isIdentifierNode = (name) => name !== undefined && isIdentifier(name);
const identifierName = (name) => (isIdentifierNode(name) ? name : undefined);
const declared = (name, kind) => {
    const identifier = identifierName(name);
    return identifier === undefined ? [] : [{ name: identifier, kind }];
};
const memberName = (node, name, kind) => {
    const isOthersShape = isOverride(node) || isInObjectLiteral(node);
    return isOthersShape ? [] : declared(name, kind);
};
/**
 * The name a node declares, when the layer chose it. Destructured names are the source's property names unless
 * renamed; object-literal keys and override methods follow a shape someone else defined.
 */
const declaredBy = (node) => {
    if (isVariableDeclaration(node))
        return declared(node.name, isFunctionValue(node.initializer) ? "function" : "value");
    if (isParameterDeclaration(node))
        return declared(node.name, "value");
    if (isBindingElement(node))
        return node.propertyName === undefined ? [] : declared(node.name, "value");
    if (isFunctionDeclaration(node))
        return declared(node.name, "function");
    const isTypeDeclaration = isClassDeclaration(node) || isInterfaceDeclaration(node) || isTypeAliasDeclaration(node) || isEnumDeclaration(node);
    if (isTypeDeclaration)
        return declared(node.name, "type");
    const isProperty = isPropertyDeclaration(node) || isPropertySignatureDeclaration(node);
    if (isProperty)
        return memberName(node, node.name, "value");
    const isMethod = isMethodDeclaration(node) || isMethodSignatureDeclaration(node) || isGetAccessorDeclaration(node) || isSetAccessorDeclaration(node);
    return isMethod ? memberName(node, node.name, "function") : [];
};
/** The 0-based line containing an offset, by binary search over the line starts. */
const lineIndex = (starts, offset) => {
    const search = (low, high) => {
        if (low >= high)
            return low;
        const middle = Math.ceil((low + high) / 2);
        return (starts[middle] ?? 0) <= offset ? search(middle, high) : search(low, middle - 1);
    };
    return search(0, starts.length - 1);
};
/** The file's own name, without directories or any extension: customerList.test.ts is customerList. */
const fileName = (path) => basename(path).split(".").at(0) ?? "";
/** Every name the file declares, and the file's own name. */
export const ownedNames = (source) => {
    const starts = computeLineStarts(source.text);
    const names = descendants(source).flatMap(declaredBy).map(({ name, kind }) => {
        const offset = name.getStart(source);
        const line = lineIndex(starts, offset);
        const isTopLevel = kind === "type" && name.parent.parent.kind === SyntaxKind.SourceFile;
        return {
            text: name.text, kind, node: name, line: line + 1, column: offset - (starts[line] ?? 0) + 1,
            ...(isTopLevel ? { topLevelType: true } : {}),
        };
    });
    return [{ text: fileName(source.fileName), kind: "file" }, ...names];
};
//# sourceMappingURL=glossaryNames.js.map