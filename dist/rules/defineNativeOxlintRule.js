import { defineRule } from "../core/defineRule.js";
export const defineNativeOxlintRule = (rule) => {
    const { rule: native, configuration, ...documentation } = rule;
    return defineRule({ ...documentation, enforcement: { type: "oxlint", rule: native, configuration } });
};
//# sourceMappingURL=defineNativeOxlintRule.js.map