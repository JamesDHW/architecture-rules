import type { Rule } from "eslint";
export declare const preferSwitchRule: {
    readonly id: "prefer-switch";
    readonly title: "Prefer switch over repeated equality ifs";
    readonly description: string;
    readonly instead: "Use a switch on the value, or a readonly record when each case only maps to a value.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=preferSwitch.rule.d.ts.map