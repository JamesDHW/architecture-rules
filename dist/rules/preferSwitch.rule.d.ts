import type { Rule } from "eslint";
export declare const preferSwitchRule: {
    readonly id: "prefer-switch";
    readonly title: "Prefer switch over repeated equality ifs";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=preferSwitch.rule.d.ts.map