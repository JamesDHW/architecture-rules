import { namedPredicatesRule } from "../src/rules/namedPredicates.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(namedPredicatesRule, {
  valid: [
    {
      name: "named predicate variable",
      code: `
const isEligibleForDiscount =
  user.premium === true || basket.amount > 1000000 || user.orders.length > 20;
if (isEligibleForDiscount) {
  currentOrder.addDiscount(PREMIUM_DISCOUNT_RATE);
}
`.trim(),
    },
    {
      name: "call expression predicate",
      code: "if (hasAccess(token)) {\n  return homepageResponse();\n}\n",
    },
    {
      name: "comparison is not a logical operation",
      code: "if (basket.amount > 1000000) {\n  addDiscount();\n}\n",
    },
    {
      name: "logical combination assigned, not used as the condition",
      code: "const isAAndB = a && b;\n",
    },
  ],
  invalid: [
    {
      name: "anonymous || in if",
      code: `
if (user.premium === true || basket.amount > 1000000 || user.orders.length > 20) {
  currentOrder.addDiscount(PREMIUM_DISCOUNT_RATE);
}
`.trim(),
      errors: [{ messageId: "namedPredicate" }],
    },
    {
      name: "anonymous && in while",
      code: "while (hasMessages && !isCancelled) {\n  deliver();\n}\n",
      errors: [{ messageId: "namedPredicate" }],
    },
    {
      name: "anonymous || in ternary",
      code: "const label = isDraft || isArchived ? \"hidden\" : \"visible\";\n",
      errors: [{ messageId: "namedPredicate" }],
    },
  ],
});
