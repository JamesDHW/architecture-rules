import {
  isArrayLiteralExpression, isBlock, isIdentifier, isNoSubstitutionTemplateLiteral, isNumericLiteral, isParenthesizedExpression,
  isReturnStatement, isStringLiteral, isVoidExpression, SyntaxKind, type Expression, type Node,
} from "typescript/unstable/ast";

/** Strips any wrapping parentheses. */
export const unwrapped = (expression: Expression): Expression => {
  return isParenthesizedExpression(expression) ? unwrapped(expression.expression) : expression;
};

const isEmptyText = (expression: Expression): boolean => {
  const isText = isStringLiteral(expression) || isNoSubstitutionTemplateLiteral(expression);
  return isText && expression.text === "";
};

const isEmptyKeyword = (expression: Expression): boolean => {
  const isNull = expression.kind === SyntaxKind.NullKeyword;
  const isFalse = expression.kind === SyntaxKind.FalseKeyword;
  const isUndefined = isIdentifier(expression) && expression.text === "undefined";
  return isNull || isFalse || isUndefined;
};

const isZero = (expression: Expression): boolean => isNumericLiteral(expression) && Number(expression.text) === 0;

const isEmptyArray = (expression: Expression): boolean => isArrayLiteralExpression(expression) && expression.elements.length === 0;

/** null, undefined, void anything, false, 0, "" or []: a value that says nothing. */
export const isEmptyValue = (value: Expression): boolean => {
  const expression = unwrapped(value);
  return isEmptyKeyword(expression) || isZero(expression) || isEmptyText(expression) || isEmptyArray(expression) || isVoidExpression(expression);
};

/** A statement that only returns nothing or an empty value: return; return null; { return []; } */
export const isEmptyReturn = (statement: Node): boolean => {
  if (isBlock(statement)) {
    const [only, ...rest] = statement.statements;
    return only !== undefined && rest.length === 0 && isEmptyReturn(only);
  }
  if (!isReturnStatement(statement)) return false;
  return statement.expression === undefined || isEmptyValue(statement.expression);
};
