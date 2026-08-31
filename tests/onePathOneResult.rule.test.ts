import { onePathOneResultRule } from "../src/rules/onePathOneResult.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(onePathOneResultRule, {
  valid: [
    {
      name: "combined predicates",
      code: `
if (a || b) {
  pouet();
}
if (c) {
  plop();
}
`.trim(),
    },
    {
      name: "different results",
      code: `
if (token.hasExpired()) {
  return loginPageResponse();
}
if (!hasAccess(token)) {
  return accessDeniedResponse();
}
`.trim(),
    },
  ],
  invalid: [
    {
      name: "sibling ifs with the same call",
      code: `
if (a) {
  pouet();
}
if (c) {
  plop();
}
if (b) {
  pouet();
}
`.trim(),
      errors: [{ messageId: "sameResult" }],
    },
    {
      name: "if else with identical bodies",
      code: `
if (a) {
  pouet();
} else {
  pouet();
}
`.trim(),
      errors: [{ messageId: "sameResult" }],
    },
  ],
});
