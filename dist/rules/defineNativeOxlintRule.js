import { defineRule } from "../core/defineRule.js";
export const defineNativeOxlintRule = (rule) => {
    return defineRule({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        enforcement: {
            type: "oxlint",
            rule: rule.rule,
            configuration: rule.configuration,
        },
    });
};
//# sourceMappingURL=defineNativeOxlintRule.js.map