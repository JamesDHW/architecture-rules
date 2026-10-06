import type { PredicateNode } from "./structuralGuardCondition.js";
import { type SyntaxNode } from "./syntaxNode.js";
/** Copies the fields PredicateNode declares from a syntax node, validating each one instead of asserting the shape. */
export declare const readPredicateNode: (node: SyntaxNode) => PredicateNode;
/** Reads any node-shaped value, such as a Rule.Node, as a PredicateNode. */
export declare const toPredicateNode: (value: unknown) => PredicateNode | undefined;
//# sourceMappingURL=predicateNode.d.ts.map