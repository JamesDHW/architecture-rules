import { rules } from "./rules/index.js";
const customRules = Object.fromEntries(rules.flatMap((rule) => {
    return rule.enforcement.type === "custom-oxlint" ? [[rule.id, rule.enforcement.implementation]] : [];
}));
const plugin = {
    meta: {
        name: "architecture-rules",
    },
    rules: customRules,
};
// oxlint-disable-next-line import/no-default-export -- Oxlint loads a JS plugin from its module's default export.
export default plugin;
//# sourceMappingURL=plugin.js.map