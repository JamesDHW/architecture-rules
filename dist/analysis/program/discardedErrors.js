import { isBinaryExpression, isCallExpression, isConditionalExpression, isIfStatement, isPrefixUnaryExpression, SyntaxKind, } from "typescript/unstable/ast";
import { SignatureKind, SymbolFlags } from "typescript/unstable/sync";
import { descendants } from "../syntaxTree.js";
import { isEmptyReturn, isEmptyValue, unwrapped } from "./emptyValues.js";
import { lineOf, programFiles, severityOf } from "./programFile.js";
import { PROGRAM_RULES } from "../../rules/programRules.constants.js";
const isNotOperator = (expression) => {
    return isPrefixUnaryExpression(expression) && expression.operator === SyntaxKind.ExclamationToken;
};
const narrowingOf = (condition, isNegated) => {
    const expression = unwrapped(condition);
    return isNotOperator(expression) ? narrowingOf(expression.operand, !isNegated) : { test: expression, isNegated };
};
const conditionalCandidates = (node) => {
    if (!isConditionalExpression(node))
        return [];
    const narrowing = narrowingOf(node.condition, false);
    return [
        ...(isEmptyValue(node.whenTrue) ? [{ node, narrowing, isWhenTrue: true }] : []),
        ...(isEmptyValue(node.whenFalse) ? [{ node, narrowing, isWhenTrue: false }] : []),
    ];
};
/** Only an if's own branch is judged: what runs after a negated guard is the rest of the function. */
const ifCandidates = (node) => {
    if (!isIfStatement(node))
        return [];
    const narrowing = narrowingOf(node.expression, false);
    return isEmptyReturn(node.thenStatement) ? [{ node, narrowing, isWhenTrue: true }] : [];
};
const isInstanceOfTest = (test) => {
    return isBinaryExpression(test) && test.operatorToken.kind === SyntaxKind.InstanceOfKeyword;
};
const instanceTypes = (checker, constructor) => {
    const constructorType = checker.getTypeAtLocation(constructor);
    if (constructorType === undefined)
        return [];
    return checker.getSignaturesOfType(constructorType, SignatureKind.Construct)
        .map((signature) => checker.getReturnTypeOfSignature(signature))
        .filter((type) => type !== undefined);
};
const predicateTypes = (checker, test) => {
    if (!isCallExpression(test))
        return [];
    const signature = checker.getResolvedSignature(test);
    const predicate = signature === undefined ? undefined : checker.getTypePredicateOfSignature(signature);
    return predicate?.type === undefined ? [] : [predicate.type];
};
/** The types a test narrows its subject to: an instanceof class's instances, or a type predicate's type. */
const narrowedTypes = (checker, test) => {
    return isInstanceOfTest(test) ? instanceTypes(checker, test.right) : predicateTypes(checker, test);
};
/** Only instanceof tests and calls can narrow to a class; anything else is not looked up. */
const isTestShaped = (candidate) => {
    const { test } = candidate.narrowing;
    return isInstanceOfTest(test) || isCallExpression(test);
};
/** The branch that runs on the error: when the test holds, unless a ! flips it. */
const isErrorBranch = (candidate) => candidate.isWhenTrue !== candidate.narrowing.isNegated;
const errorTypeOf = (entry) => {
    const symbol = entry.project.checker.resolveName("Error", SymbolFlags.Type, entry.source, false);
    return symbol === undefined ? undefined : entry.project.checker.getDeclaredTypeOfSymbol(symbol);
};
const MESSAGE = "This branch turns an error into an empty value, so callers cannot tell the failure from \"nothing there\". Return or pass on the error, or log it first.";
const fileIssues = (entry, severity) => {
    const candidates = descendants(entry.source)
        .flatMap((node) => [...conditionalCandidates(node), ...ifCandidates(node)])
        .filter(isTestShaped)
        .filter(isErrorBranch);
    if (candidates.length === 0)
        return [];
    const errorType = errorTypeOf(entry);
    if (errorType === undefined)
        return [];
    const { checker } = entry.project;
    const isErrorTest = (candidate) => narrowedTypes(checker, candidate.narrowing.test).some((type) => checker.isTypeAssignableTo(type, errorType));
    return candidates.filter(isErrorTest).map((candidate) => ({
        ruleId: PROGRAM_RULES.discardedErrors, file: entry.file.relative, line: lineOf(entry.source, candidate.node), severity, message: MESSAGE,
    }));
};
/** Error branches that return or evaluate to an empty value, in the given files. */
export const discardedErrors = ({ architecture, files, projects }) => {
    return programFiles(projects, files).flatMap((entry) => {
        const severity = severityOf(architecture, { file: entry.file, ruleId: PROGRAM_RULES.discardedErrors });
        return severity === undefined ? [] : fileIssues(entry, severity);
    });
};
//# sourceMappingURL=discardedErrors.js.map