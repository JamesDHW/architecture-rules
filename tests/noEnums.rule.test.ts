import { noEnumsRule } from "../src/rules/noEnums.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(noEnumsRule, {
  valid: [
    {
      name: "literal union",
      code: 'type ProjectStatus = "draft" | "active" | "archived";\n',
    },
  ],
  invalid: [
    {
      name: "enum declaration",
      code: "enum ProjectStatus { Draft, Active }\n",
      errors: [{ messageId: "noEnums" }],
    },
  ],
});
