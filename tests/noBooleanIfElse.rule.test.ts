import { noBooleanIfElseRule } from "../src/rules/noBooleanIfElse.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noBooleanIfElseRule, {
  valid: [
    {
      name: "pass the boolean directly",
      code: "setBillingAddressSameAsShippingAddress(isEmpty(props.billingAddress));\n",
    },
    {
      name: "named boolean then pass it",
      code: `
const hasBillingAddress = isEmpty(props.billingAddress);
setBillingAddressSameAsShippingAddress(hasBillingAddress);
`.trim(),
    },
    {
      name: "branches call different functions",
      code: `
if (isEmpty(props.billingAddress)) {
  setBillingAddressSameAsShippingAddress(true);
} else {
  setShippingAddress(false);
}
`.trim(),
    },
    {
      name: "branches pass non-boolean arguments",
      code: `
if (isPrimary) {
  setLabel("primary");
} else {
  setLabel("secondary");
}
`.trim(),
    },
  ],
  invalid: [
    {
      name: "if else passing true and false",
      code: `
if (isEmpty(props.billingAddress)) {
  setBillingAddressSameAsShippingAddress(true);
} else {
  setBillingAddressSameAsShippingAddress(false);
}
`.trim(),
      errors: [{ messageId: "booleanIfElse" }],
    },
    {
      name: "reversed true false without blocks",
      code: "if (isReady) setOpen(false); else setOpen(true);\n",
      errors: [{ messageId: "booleanIfElse" }],
    },
  ],
});
