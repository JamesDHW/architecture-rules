import { type Expression, type Node } from "typescript/unstable/ast";
/** Strips any wrapping parentheses. */
export declare const unwrapped: (expression: Expression) => Expression;
/** null, undefined, void anything, false, 0, "" or []: a value that says nothing. */
export declare const isEmptyValue: (value: Expression) => boolean;
/** A statement that only returns nothing or an empty value: return; return null; { return []; } */
export declare const isEmptyReturn: (statement: Node) => boolean;
//# sourceMappingURL=emptyValues.d.ts.map