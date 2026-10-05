import { noLetRule } from "../src/rules/noLet.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noLetRule, {
  valid: [
    { name: "const binding", code: "const count = 1;\n" },
    { name: "const in for-of", code: "for (const item of items) { use(item); }\n" },
  ],
  invalid: [
    { name: "let binding", code: "let count = 0;\ncount += 1;\n", errors: [{ messageId: "noLet" }] },
    { name: "let without initializer", code: "let socket;\n", errors: [{ messageId: "noLet" }] },
    { name: "let in for-of", code: "for (let item of items) { use(item); }\n", errors: [{ messageId: "noLet" }] },
  ],
});
