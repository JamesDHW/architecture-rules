import { rules } from "./rules/index.js";
const customRules = Object.fromEntries(rules.flatMap((rule) => {
    if (rule.enforcement.type !== "custom-oxlint") {
        return [];
    }
    return [[rule.id, rule.enforcement.implementation]];
}));
const plugin = {
    meta: {
        name: "architecture-rules",
    },
    rules: customRules,
};
export default plugin;
//# sourceMappingURL=plugin.js.map