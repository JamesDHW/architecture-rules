import {
  isBinaryExpression, isCallExpression, isConditionalExpression, isIfStatement, isPrefixUnaryExpression, SyntaxKind,
  type Expression, type Node,
} from "typescript/unstable/ast";
import { SignatureKind, SymbolFlags, type Checker, type Type } from "typescript/unstable/sync";

import { descendants } from "../syntaxTree.js";
import { isEmptyReturn, isEmptyValue, unwrapped } from "./emptyValues.js";
import { lineOf, programFiles, severityOf, type ProgramFile, type ProgramIssue, type ProgramScope } from "./programFile.js";
import { PROGRAM_RULES } from "../../rules/programRules.constants.js";

/** A condition that narrows to some type: the test itself, and whether a ! flips which branch it narrows. */
type Narrowing = { readonly test: Expression; readonly isNegated: boolean };

/** An empty-valued branch that runs when its condition holds, or when it fails. */
type Candidate = { readonly node: Node; readonly narrowing: Narrowing; readonly isWhenTrue: boolean };

const isNotOperator = (expression: Expression): expression is Expression & { readonly operand: Expression } => {
  return isPrefixUnaryExpression(expression) && expression.operator === SyntaxKind.ExclamationToken;
};

const narrowingOf = (condition: Expression, isNegated: boolean): Narrowing => {
  const expression = unwrapped(condition);
  return isNotOperator(expression) ? narrowingOf(expression.operand, !isNegated) : { test: expression, isNegated };
};

const conditionalCandidates = (node: Node): readonly Candidate[] => {
  if (!isConditionalExpression(node)) return [];
  const narrowing = narrowingOf(node.condition, false);
  return [
    ...(isEmptyValue(node.whenTrue) ? [{ node, narrowing, isWhenTrue: true }] : []),
    ...(isEmptyValue(node.whenFalse) ? [{ node, narrowing, isWhenTrue: false }] : []),
  ];
};

/** Only an if's own branch is judged: what runs after a negated guard is the rest of the function. */
const ifCandidates = (node: Node): readonly Candidate[] => {
  if (!isIfStatement(node)) return [];
  const narrowing = narrowingOf(node.expression, false);
  return isEmptyReturn(node.thenStatement) ? [{ node, narrowing, isWhenTrue: true }] : [];
};

const isInstanceOfTest = (test: Expression): test is Expression & { readonly right: Expression } => {
  return isBinaryExpression(test) && test.operatorToken.kind === SyntaxKind.InstanceOfKeyword;
};

const instanceTypes = (checker: Checker, constructor: Expression): readonly Type[] => {
  const constructorType = checker.getTypeAtLocation(constructor);
  if (constructorType === undefined) return [];
  return checker.getSignaturesOfType(constructorType, SignatureKind.Construct)
    .map((signature) => checker.getReturnTypeOfSignature(signature))
    .filter((type) => type !== undefined);
};

const predicateTypes = (checker: Checker, test: Expression): readonly Type[] => {
  if (!isCallExpression(test)) return [];
  const signature = checker.getResolvedSignature(test);
  const predicate = signature === undefined ? undefined : checker.getTypePredicateOfSignature(signature);
  return predicate?.type === undefined ? [] : [predicate.type];
};

/** The types a test narrows its subject to: an instanceof class's instances, or a type predicate's type. */
const narrowedTypes = (checker: Checker, test: Expression): readonly Type[] => {
  return isInstanceOfTest(test) ? instanceTypes(checker, test.right) : predicateTypes(checker, test);
};

/** Only instanceof tests and calls can narrow to a class; anything else is not looked up. */
const isTestShaped = (candidate: Candidate): boolean => {
  const { test } = candidate.narrowing;
  return isInstanceOfTest(test) || isCallExpression(test);
};

/** The branch that runs on the error: when the test holds, unless a ! flips it. */
const isErrorBranch = (candidate: Candidate): boolean => candidate.isWhenTrue !== candidate.narrowing.isNegated;

const errorTypeOf = (entry: ProgramFile): Type | undefined => {
  const symbol = entry.project.checker.resolveName("Error", SymbolFlags.Type, entry.source, false);
  return symbol === undefined ? undefined : entry.project.checker.getDeclaredTypeOfSymbol(symbol);
};

const MESSAGE = "This branch turns an error into an empty value, so callers cannot tell the failure from \"nothing there\". Return or pass on the error, or log it first.";

const fileIssues = (entry: ProgramFile, severity: "error" | "warn"): readonly ProgramIssue[] => {
  const candidates = descendants(entry.source)
    .flatMap((node) => [...conditionalCandidates(node), ...ifCandidates(node)])
    .filter(isTestShaped)
    .filter(isErrorBranch);
  if (candidates.length === 0) return [];
  const errorType = errorTypeOf(entry);
  if (errorType === undefined) return [];
  const { checker } = entry.project;
  const isErrorTest = (candidate: Candidate): boolean => narrowedTypes(checker, candidate.narrowing.test).some((type) => checker.isTypeAssignableTo(type, errorType));
  return candidates.filter(isErrorTest).map((candidate) => ({
    ruleId: PROGRAM_RULES.discardedErrors, file: entry.file.relative, line: lineOf(entry.source, candidate.node), severity, message: MESSAGE,
  }));
};

/** Error branches that return or evaluate to an empty value, in the given files. */
export const discardedErrors = ({ architecture, files, projects }: ProgramScope): readonly ProgramIssue[] => {
  return programFiles(projects, files).flatMap((entry) => {
    const severity = severityOf(architecture, { file: entry.file, ruleId: PROGRAM_RULES.discardedErrors });
    return severity === undefined ? [] : fileIssues(entry, severity);
  });
};
