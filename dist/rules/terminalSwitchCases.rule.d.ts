import type { Rule } from "eslint";
export declare const terminalSwitchCasesRule: {
    readonly id: "terminal-switch-cases";
    readonly title: "Return from switch cases in a focused operation";
    readonly description: string;
    readonly instead: "Return from every case; move shared follow-up work into a helper the case returns.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=terminalSwitchCases.rule.d.ts.map