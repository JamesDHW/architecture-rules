import type { Rule } from "eslint";
export declare const noArrayMutationRule: {
    readonly id: "no-array-mutation";
    readonly title: "Build new arrays instead of changing them in place";
    readonly description: string;
    readonly instead: "Build a new array with map, filter, flatMap, a spread, toSorted or Array.fromAsync instead of changing one in place.";
    readonly suppressWhen: "In-place change is measurably faster on a hot path; name the measurement in the reason.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noArrayMutation.rule.d.ts.map