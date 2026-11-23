import { isArrayLiteralExpression, isArrayTypeNode, isAsExpression, isNoSubstitutionTemplateLiteral, isNumericLiteral, isPrefixUnaryExpression, isSatisfiesExpression, isStringLiteral, isTypeOperatorNode, isTypeReferenceNode, SyntaxKind, } from "typescript/unstable/ast";
import { isPresent } from "../../core/guards.js";
import { descendants } from "../syntaxTree.js";
import { unwrapped } from "./emptyValues.js";
import { lineOf, programFiles, severityOf } from "./programFile.js";
import { PROGRAM_RULES } from "../../rules/programRules.constants.js";
/** The list without `as const` and parentheses. */
const listOf = (expression) => {
    const inner = unwrapped(expression);
    return isAsExpression(inner) ? listOf(inner.expression) : inner;
};
/** T in Array<T> or ReadonlyArray<T>. */
const genericElement = (type) => {
    if (!isTypeReferenceNode(type))
        return undefined;
    const name = type.typeName.getText();
    const [argument, ...rest] = type.typeArguments ?? [];
    const isArrayOfOne = rest.length === 0 && (name === "Array" || name === "ReadonlyArray");
    return isArrayOfOne ? argument : undefined;
};
/** T in T[], readonly T[], Array<T> or ReadonlyArray<T>. */
const elementTypeNode = (type) => {
    if (isTypeOperatorNode(type))
        return elementTypeNode(type.type);
    return isArrayTypeNode(type) ? type.elementType : genericElement(type);
};
const isNegation = (element) => {
    return isPrefixUnaryExpression(element) && element.operator === SyntaxKind.MinusToken;
};
const negativeNumber = (element) => {
    if (!isNegation(element))
        return undefined;
    return isNumericLiteral(element.operand) ? -Number(element.operand.text) : undefined;
};
const isTextLiteral = (element) => {
    return isStringLiteral(element) || isNoSubstitutionTemplateLiteral(element);
};
const literalOf = (element) => {
    if (isTextLiteral(element))
        return element.text;
    if (isNumericLiteral(element))
        return Number(element.text);
    if (element.kind === SyntaxKind.TrueKeyword)
        return true;
    if (element.kind === SyntaxKind.FalseKeyword)
        return false;
    return negativeNumber(element);
};
/** Every value of a literal list, or undefined when any element is not a literal. */
const listedValues = (list) => {
    if (!isArrayLiteralExpression(list))
        return undefined;
    const values = list.elements.map(literalOf);
    return values.every(isPresent) ? values.filter(isPresent) : undefined;
};
const memberValue = (type) => {
    if (!type.isLiteralType())
        return undefined;
    const { value } = type;
    return typeof value === "bigint" ? undefined : value;
};
/** Every member of a union of literals, or undefined when the type is not one. */
const unionValues = (checker, node) => {
    const type = checker.getTypeFromTypeNode(node);
    if (type?.isUnionType() !== true)
        return undefined;
    const values = type.getTypes().map(memberValue);
    return values.every(isPresent) ? values.filter(isPresent) : undefined;
};
const shown = (value) => typeof value === "string" ? JSON.stringify(value) : String(value);
/** The members of the satisfied union that the list leaves out; empty when it is not a literal list over a literal union. */
const missingMembers = (entry, node) => {
    const element = elementTypeNode(node.type);
    if (element === undefined)
        return [];
    const members = unionValues(entry.project.checker, element) ?? [];
    const values = listedValues(listOf(node.expression));
    return values === undefined ? [] : members.filter((member) => !values.includes(member));
};
const issueFor = ({ entry, severity }, node) => {
    const missing = missingMembers(entry, node);
    if (missing.length === 0)
        return undefined;
    const message = `This list satisfies ${node.type.getText(entry.source)} but leaves out ${missing.map(shown).join(", ")}. Add them, or declare a deliberate subset with a type annotation instead of satisfies.`;
    return { ruleId: PROGRAM_RULES.literalLists, file: entry.file.relative, line: lineOf(entry.source, node), severity, message };
};
/** Literal lists that satisfy a union of literals but leave members out. */
export const literalLists = ({ architecture, files, projects }) => {
    return programFiles(projects, files).flatMap((entry) => {
        const severity = severityOf(architecture, { file: entry.file, ruleId: PROGRAM_RULES.literalLists });
        if (severity === undefined)
            return [];
        return descendants(entry.source).filter(isSatisfiesExpression).map((node) => issueFor({ entry, severity }, node)).filter(isPresent);
    });
};
//# sourceMappingURL=literalLists.js.map