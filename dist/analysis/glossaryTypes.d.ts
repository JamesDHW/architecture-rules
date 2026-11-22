import type { Checker, Type } from "typescript/unstable/sync";
/**
 * What a value's type says, for the glossary: the declarations it reaches (itself, what it unions, what it contains,
 * what it extends), and what its innermost types are. A type that cannot be judged, such as any or an unresolved
 * import, is indeterminate: no glossary check uses it.
 */
export type JudgedType = {
    readonly reaches: ReadonlySet<string>;
    /** Every type looked at except null, undefined and void: the type itself, its members and what it contains. */
    readonly types: readonly Type[];
    readonly indeterminate: boolean;
    /** Some innermost type is an object type: a class, interface or object shape. */
    readonly object: boolean;
    /** Some innermost type is a primitive or literal, such as string or "x". */
    readonly primitive: boolean;
};
/** A declaration's identity in the snapshot, the same in every project that holds the file. */
export declare const declarationKeys: (symbol: ReturnType<Type["getSymbol"]>) => readonly string[];
/** Reads a value's type: Customer, Customer[], Promise<Customer> and Customer | undefined all reach Customer. */
export declare const judgeType: (checker: Checker, type: Type | undefined) => JudgedType;
/** A term's type, as its declarations and, for the checker of one project, the type itself. */
export type TermType = {
    readonly keys: readonly string[];
    readonly type?: Type;
};
/** Whether the judged type refers to the term's declaration itself, directly or through what it contains or extends. */
export declare const reachesTermType: (judged: JudgedType, term: TermType) => boolean;
/**
 * Whether the judged type is the term's type: it reaches the declaration, or it or a member is assignable to it, as a
 * subtype or an intersection such as Issue & { line: number } is.
 */
export declare const isOfTermType: (checker: Checker, judged: JudgedType, term: TermType) => boolean;
//# sourceMappingURL=glossaryTypes.d.ts.map