/** How far into a type to look: Customer[] | undefined is three levels deep. */
const maxDepth = 4;
const indeterminateNames = new Set(["any", "unknown", "error", "never"]);
const neutralNames = new Set(["undefined", "null", "void"]);
/** A declaration's identity in the snapshot, the same in every project that holds the file. */
export const declarationKeys = (symbol) => {
    return (symbol?.declarations ?? []).map((declaration) => `${declaration.path}#${declaration.index}`);
};
const intrinsicLeaf = (type) => {
    const name = type.isIntrinsicType() ? type.intrinsicName : "";
    if (indeterminateNames.has(name))
        return "indeterminate";
    return neutralNames.has(name) ? "neutral" : "primitive";
};
/** A union or an intersection: what it is depends on its members. */
const isCombination = (type) => type.isUnionType() || type.isIntersectionType();
const ownKeys = (type) => [...declarationKeys(type.getSymbol()), ...declarationKeys(type.getAliasSymbol())];
const baseKeys = (type, depth) => {
    const hasNoBases = depth >= maxDepth || !type.isClassOrInterface();
    if (hasNoBases)
        return [];
    return (type.getBaseTypes() ?? []).flatMap((base) => [...ownKeys(base), ...baseKeys(base, depth + 1)]);
};
const walk = (checker, type, depth) => {
    const isUnjudgeable = type.isErrorType() || type.isTypeParameter();
    if (isUnjudgeable)
        return { keys: [], leaves: ["indeterminate"], types: [] };
    if (depth >= maxDepth)
        return { keys: ownKeys(type), leaves: ["indeterminate"], types: [type] };
    const keys = [...ownKeys(type), ...baseKeys(type, depth)];
    const inner = (members) => {
        const walked = members.map((member) => walk(checker, member, depth + 1));
        return { keys: [...keys, ...walked.flatMap((entry) => entry.keys)], leaves: walked.flatMap((entry) => entry.leaves), types: [type, ...walked.flatMap((entry) => entry.types)] };
    };
    if (isCombination(type))
        return inner(type.getTypes());
    const typeArguments = type.isTypeReference() ? checker.getTypeArguments(type) : [];
    if (typeArguments.length > 0)
        return inner(typeArguments);
    if (type.isObjectType())
        return { keys, leaves: ["object"], types: [type] };
    if (!type.isIntrinsicType())
        return { keys, leaves: ["primitive"], types: [type] };
    const leaf = intrinsicLeaf(type);
    return { keys, leaves: [leaf], types: leaf === "neutral" ? [] : [type] };
};
/** Reads a value's type: Customer, Customer[], Promise<Customer> and Customer | undefined all reach Customer. */
export const judgeType = (checker, type) => {
    if (type === undefined)
        return { reaches: new Set(), types: [], indeterminate: true, object: false, primitive: false };
    const { keys, leaves, types } = walk(checker, type, 0);
    return { reaches: new Set(keys), types, indeterminate: leaves.includes("indeterminate"), object: leaves.includes("object"), primitive: leaves.includes("primitive") };
};
/** Whether the judged type refers to the term's declaration itself, directly or through what it contains or extends. */
export const reachesTermType = (judged, term) => term.keys.some((key) => judged.reaches.has(key));
/**
 * Whether the judged type is the term's type: it reaches the declaration, or it or a member is assignable to it, as a
 * subtype or an intersection such as Issue & { line: number } is.
 */
export const isOfTermType = (checker, judged, term) => {
    if (term.keys.length === 0)
        return false;
    if (reachesTermType(judged, term))
        return true;
    const { type } = term;
    if (type === undefined)
        return false;
    return judged.types.some((candidate) => checker.isTypeAssignableTo(candidate, type));
};
//# sourceMappingURL=glossaryTypes.js.map