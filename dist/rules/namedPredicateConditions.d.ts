import type { Rule } from "eslint";
import { type GuardNames, type PredicateNode } from "./structuralGuardCondition.js";
/** True when test is, beneath unary operators and transparent wrappers, a compound condition outside the structural guard exception. */
export declare const needsName: (test: PredicateNode | undefined, guards: GuardNames) => boolean;
export declare const isNullishFallback: (node: Rule.Node, guards: GuardNames) => boolean;
/** The condition of an && chain that ends in JSX, such as isOwner && <EditButton />; undefined for other expressions. */
export declare const getJsxPresenceCondition: (node: unknown) => PredicateNode | undefined;
/** The right operand of an enclosing && is checked as part of that outer chain. */
export declare const continuesAndChain: (node: Rule.Node) => boolean;
//# sourceMappingURL=namedPredicateConditions.d.ts.map