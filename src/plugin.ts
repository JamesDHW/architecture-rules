import type { ESLint, Rule } from "eslint";

import { rules } from "./rules/index.js";

const customRules = Object.fromEntries(
  rules.flatMap((rule) => {
    if (rule.enforcement.type !== "custom-oxlint") {
      return [];
    }

    return [[rule.id, rule.enforcement.implementation]];
  }),
) as Record<string, Rule.RuleModule>;

const plugin: ESLint.Plugin = {
  meta: {
    name: "architecture-rules",
  },

  rules: customRules,
};

export default plugin;
