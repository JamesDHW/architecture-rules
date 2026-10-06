import type { Rule } from "eslint";

import { isPresent } from "../core/guards.js";
import type { BodyStatement, IfStatement } from "./branchStatement.js";
import { childNode, childNodes, isNodeOfType, isSyntaxNode, type SyntaxNode } from "./syntaxNode.js";

type SourceCode = Rule.RuleContext["sourceCode"];

type BinaryExpression = Extract<IfStatement["test"], { readonly type: "BinaryExpression" }>;

type Comparison = {
  readonly subject: BinaryExpression["left"];
  readonly value: BinaryExpression["left"];
};

const isDiscriminant = (node: unknown): boolean => {
  if (isNodeOfType(node, "Identifier")) return true;
  return isNodeOfType(node, "MemberExpression") && node.computed === false && isDiscriminant(node.object);
};

const isCaseValue = (node: unknown): boolean => isNodeOfType(node, "Literal") || isNodeOfType(node, "Identifier");

const comparesDiscriminant = ({ subject, value }: Comparison): boolean => isDiscriminant(subject) && isCaseValue(value);

const comparesMemberDiscriminant = (comparison: Comparison): boolean => {
  return comparison.subject.type === "MemberExpression" && comparesDiscriminant(comparison);
};

/** The source text of the value an if compares with ===, preferring member paths, then the left side. */
const getDiscriminantKey = (node: IfStatement, sourceCode: SourceCode): string | undefined => {
  const { test } = node;
  const isStrictEquality = test.type === "BinaryExpression" && test.operator === "===";
  if (!isStrictEquality) return undefined;
  const comparisons = [{ subject: test.left, value: test.right }, { subject: test.right, value: test.left }];
  const discriminant = comparisons.find(comparesMemberDiscriminant) ?? comparisons.find(comparesDiscriminant);
  return discriminant === undefined ? undefined : sourceCode.getText(discriminant.subject);
};

const childrenUnder = (node: SyntaxNode, key: string): readonly SyntaxNode[] => {
  return [childNode(node, key), ...childNodes(node, key)].filter(isPresent);
};

const containsJsx = (node: unknown, visitorKeys: SourceCode["visitorKeys"]): boolean => {
  if (!isSyntaxNode(node)) return false;
  const isJsx = node.type === "JSXElement" || node.type === "JSXFragment";
  return isJsx || (visitorKeys[node.type] ?? []).some((key) => {
    return childrenUnder(node, key).some((child) => containsJsx(child, visitorKeys));
  });
};

const hasTerminalConsequent = ({ consequent }: IfStatement): boolean => {
  const last = consequent.type === "BlockStatement" ? consequent.body.at(-1) : consequent;
  return last?.type === "ReturnStatement" || last?.type === "ThrowStatement";
};

const allShareDiscriminant = (nodes: readonly IfStatement[], sourceCode: SourceCode): boolean => {
  const keys = nodes.map((node) => getDiscriminantKey(node, sourceCode));
  const [first] = keys;
  return keys.length >= 2 && first !== undefined && keys.every((key) => key === first);
};

/** The first if of a run that a switch should replace, when the whole run qualifies. */
export const getSwitchCandidateHead = (nodes: readonly IfStatement[], sourceCode: SourceCode): IfStatement | undefined => {
  const isSwitchCandidate = nodes.every(hasTerminalConsequent) &&
    !nodes.some((node) => containsJsx(node, sourceCode.visitorKeys)) &&
    allShareDiscriminant(nodes, sourceCode);
  return isSwitchCandidate ? nodes[0] : undefined;
};

/** An if followed by its else-if chain. */
export const collectChainIfs = (node: IfStatement): readonly IfStatement[] => {
  return node.alternate?.type === "IfStatement" ? [node, ...collectChainIfs(node.alternate)] : [node];
};

const getStandaloneIfKey = (statement: BodyStatement, sourceCode: SourceCode): string | undefined => {
  const isStandaloneIf = statement.type === "IfStatement" && !isPresent(statement.alternate);
  return isStandaloneIf ? getDiscriminantKey(statement, sourceCode) : undefined;
};

const continuesRun = (keys: readonly (string | undefined)[], index: number): boolean => {
  const key = keys[index];
  return key !== undefined && key === keys[index - 1];
};

/** Maximal runs of two or more adjacent else-free ifs that compare the same discriminant. */
export const collectConsecutiveIfRuns = (
  statements: readonly BodyStatement[],
  sourceCode: SourceCode,
): readonly (readonly IfStatement[])[] => {
  const keys = statements.map((statement) => getStandaloneIfKey(statement, sourceCode));
  const runStarts = [...keys.keys()].filter((index) => !continuesRun(keys, index));
  return runStarts
    .map((start, position) => statements.slice(start, runStarts[position + 1]))
    .map((run) => run.filter((statement) => statement.type === "IfStatement"))
    .filter((run) => run.length >= 2);
};
