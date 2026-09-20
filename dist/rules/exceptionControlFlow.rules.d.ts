import type { Rule } from "eslint";
export declare const noRawExceptionsRule: {
    readonly id: "no-raw-exceptions";
    readonly title: "Confine raw exceptions to explicit adapters";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
export declare const noFinallyRule: {
    readonly id: "no-finally";
    readonly title: "Sequence normalized operations and cleanup without finally";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
export declare const preserveCleanupFailuresRule: {
    readonly id: "preserve-cleanup-failures";
    readonly title: "Preserve operation and cleanup failures together";
    readonly description: string;
    readonly enforcement: {
        readonly type: "advisory";
    };
};
//# sourceMappingURL=exceptionControlFlow.rules.d.ts.map