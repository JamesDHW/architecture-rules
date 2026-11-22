import type { Checker, Type, UnionOrIntersectionType } from "typescript/unstable/sync";

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

/** How far into a type to look: Customer[] | undefined is three levels deep. */
const maxDepth = 4;

const indeterminateNames: ReadonlySet<string> = new Set(["any", "unknown", "error", "never"]);
const neutralNames: ReadonlySet<string> = new Set(["undefined", "null", "void"]);

/** A declaration's identity in the snapshot, the same in every project that holds the file. */
export const declarationKeys = (symbol: ReturnType<Type["getSymbol"]>): readonly string[] => {
  return (symbol?.declarations ?? []).map((declaration) => `${declaration.path}#${declaration.index}`);
};

type Leaf = "indeterminate" | "object" | "primitive" | "neutral";

type Walk = { readonly keys: readonly string[]; readonly leaves: readonly Leaf[]; readonly types: readonly Type[] };

const intrinsicLeaf = (type: Type): Leaf => {
  const name = type.isIntrinsicType() ? type.intrinsicName : "";
  if (indeterminateNames.has(name)) return "indeterminate";
  return neutralNames.has(name) ? "neutral" : "primitive";
};

/** A union or an intersection: what it is depends on its members. */
const isCombination = (type: Type): type is UnionOrIntersectionType => type.isUnionType() || type.isIntersectionType();

const ownKeys = (type: Type): readonly string[] => [...declarationKeys(type.getSymbol()), ...declarationKeys(type.getAliasSymbol())];

const baseKeys = (type: Type, depth: number): readonly string[] => {
  const hasNoBases = depth >= maxDepth || !type.isClassOrInterface();
  if (hasNoBases) return [];
  return (type.getBaseTypes() ?? []).flatMap((base) => [...ownKeys(base), ...baseKeys(base, depth + 1)]);
};

const walk = (checker: Checker, type: Type, depth: number): Walk => {
  const isUnjudgeable = type.isErrorType() || type.isTypeParameter();
  if (isUnjudgeable) return { keys: [], leaves: ["indeterminate"], types: [] };
  if (depth >= maxDepth) return { keys: ownKeys(type), leaves: ["indeterminate"], types: [type] };
  const keys = [...ownKeys(type), ...baseKeys(type, depth)];
  const inner = (members: readonly Type[]): Walk => {
    const walked = members.map((member) => walk(checker, member, depth + 1));
    return { keys: [...keys, ...walked.flatMap((entry) => entry.keys)], leaves: walked.flatMap((entry) => entry.leaves), types: [type, ...walked.flatMap((entry) => entry.types)] };
  };
  if (isCombination(type)) return inner(type.getTypes());
  const typeArguments = type.isTypeReference() ? checker.getTypeArguments(type) : [];
  if (typeArguments.length > 0) return inner(typeArguments);
  if (type.isObjectType()) return { keys, leaves: ["object"], types: [type] };
  if (!type.isIntrinsicType()) return { keys, leaves: ["primitive"], types: [type] };
  const leaf = intrinsicLeaf(type);
  return { keys, leaves: [leaf], types: leaf === "neutral" ? [] : [type] };
};

/** Reads a value's type: Customer, Customer[], Promise<Customer> and Customer | undefined all reach Customer. */
export const judgeType = (checker: Checker, type: Type | undefined): JudgedType => {
  if (type === undefined) return { reaches: new Set(), types: [], indeterminate: true, object: false, primitive: false };
  const { keys, leaves, types } = walk(checker, type, 0);
  return { reaches: new Set(keys), types, indeterminate: leaves.includes("indeterminate"), object: leaves.includes("object"), primitive: leaves.includes("primitive") };
};

/** A term's type, as its declarations and, for the checker of one project, the type itself. */
export type TermType = { readonly keys: readonly string[]; readonly type?: Type };

/** Whether the judged type refers to the term's declaration itself, directly or through what it contains or extends. */
export const reachesTermType = (judged: JudgedType, term: TermType): boolean => term.keys.some((key) => judged.reaches.has(key));

/**
 * Whether the judged type is the term's type: it reaches the declaration, or it or a member is assignable to it, as a
 * subtype or an intersection such as Issue & { line: number } is.
 */
export const isOfTermType = (checker: Checker, judged: JudgedType, term: TermType): boolean => {
  if (term.keys.length === 0) return false;
  if (reachesTermType(judged, term)) return true;
  const { type } = term;
  if (type === undefined) return false;
  return judged.types.some((candidate) => checker.isTypeAssignableTo(candidate, type));
};
