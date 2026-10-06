import type { Rule, SourceCode } from "eslint";
/** Any ESTree node, as context.report and scope lookups accept it. */
export type EstreeNode = Parameters<SourceCode["getScope"]>[0];
export declare const isFunctionNode: (node: Rule.Node) => boolean;
/** A function whose body runs later, unlike an immediately invoked function expression. */
export declare const isDeferredFunction: (node: Rule.Node) => boolean;
/** The nearest function at or above node. */
export declare const findEnclosingFunction: (node: Rule.Node | null) => Rule.Node | undefined;
/** True when node is the test of an if statement, a classic loop or a ternary. */
export declare const isBranchTest: (node: Rule.Node) => boolean;
//# sourceMappingURL=nodeContext.d.ts.map