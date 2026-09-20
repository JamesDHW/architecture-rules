import { noTypeAssertionsRule } from "../src/rules/noTypeAssertions.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noTypeAssertionsRule, {
  valid: [
    {
      name: "as const is allowed",
      code: 'const labels = { draft: "Draft" } as const;\n',
    },
    {
      name: "satisfies is allowed",
      code: 'const status = "draft" satisfies "draft" | "active";\n',
    },
  ],
  invalid: [
    {
      name: "as Type is banned",
      code: "const project = input as Project;\n",
      errors: [{ messageId: "noTypeAssertions" }],
    },
    {
      name: "angle-bracket assertion is banned",
      code: "const project = <Project>input;\n",
      errors: [{ messageId: "noTypeAssertions" }],
    },
  ],
});
