import { noCollapsibleIfRule } from "../src/rules/noCollapsibleIf.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noCollapsibleIfRule, {
  valid: [
    {
      name: "shared prefix with two inner ifs",
      code: `
if (a) {
  if (b) {
    pouet();
  }
  if (c) {
    plop();
  }
}
`.trim(),
    },
    {
      name: "named combined predicate",
      code: `
const isAAndB = a && b;
if (isAAndB) {
  pouet();
}
`.trim(),
    },
    {
      name: "inner if has else",
      code: `
if (a) {
  if (b) {
    pouet();
  } else {
    plop();
  }
}
`.trim(),
    },
  ],
  invalid: [
    {
      name: "nested if as the only body",
      code: `
if (a) {
  if (b) {
    pouet();
  }
}
`.trim(),
      errors: [{ messageId: "collapsibleIf" }],
    },
    {
      name: "nested if without blocks",
      code: "if (a) if (b) pouet();\n",
      errors: [{ messageId: "collapsibleIf" }],
    },
  ],
});
