export type PredicateNode = {
    readonly type: string;
    readonly name?: string;
    readonly operator?: string;
    readonly computed?: boolean;
    readonly optional?: boolean;
    readonly object?: PredicateNode;
    readonly property?: PredicateNode;
    readonly callee?: PredicateNode;
    readonly arguments?: readonly PredicateNode[];
    readonly argument?: PredicateNode;
    readonly left?: PredicateNode;
    readonly right?: PredicateNode;
    readonly expression?: PredicateNode;
    readonly test?: PredicateNode;
    readonly consequent?: PredicateNode;
    readonly alternate?: PredicateNode;
    readonly value?: unknown;
    readonly regex?: unknown;
};
export type GuardNames = {
    readonly nullish: readonly string[];
    readonly presence: readonly string[];
};
export declare const isStructuralGuardCondition: (condition: PredicateNode, guards: GuardNames) => boolean;
export declare const isGuardedNullishFallback: (condition: PredicateNode, guards: GuardNames) => boolean;
//# sourceMappingURL=structuralGuardCondition.d.ts.map