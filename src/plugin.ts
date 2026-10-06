import type { ESLint, Rule } from "eslint";

import { rules } from "./rules/index.js";

const customRules = Object.fromEntries(rules.flatMap((rule): readonly (readonly [string, Rule.RuleModule])[] => {
  return rule.enforcement.type === "custom-oxlint" ? [[rule.id, rule.enforcement.implementation]] : [];
}));

const plugin: ESLint.Plugin = {
  meta: {
    name: "architecture-rules",
  },
  rules: customRules,
};

// oxlint-disable-next-line import/no-default-export -- Oxlint loads a JS plugin from its module's default export.
export default plugin;
