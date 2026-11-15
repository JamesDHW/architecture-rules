import type { Rule } from "eslint";
export declare const noCapturedMutationRule: {
    readonly id: "no-captured-mutation";
    readonly title: "Keep long-lived state in *.state.ts modules";
    readonly description: string;
    readonly instead: "Build a new value inside the function, or move long-lived state into a *.state.ts module.";
    readonly suppressWhen: "A third-party API hands you a callback that must record into state you created; prefer a *.state.ts module first.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noCapturedMutation.rule.d.ts.map