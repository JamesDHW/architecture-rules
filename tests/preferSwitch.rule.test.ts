import { preferSwitchRule } from "../src/rules/preferSwitch.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(preferSwitchRule, {
  valid: [
    {
      name: "single equality if",
      code: `
if (food.type === VEGETABLE) {
  return steam(food);
}
return food;
`.trim(),
    },
    {
      name: "ifs on different properties",
      code: `
if (food.type === VEGETABLE) {
  return steam(food);
}
if (food.origin === LOCAL) {
  return grill(food);
}
`.trim(),
    },
    {
      name: "switch is already used",
      code: `
switch (food.type) {
  case VEGETABLE:
    return steam(food);
  case PROTEIN:
    return grill(food);
  default:
    return food;
}
`.trim(),
    },
  ],
  invalid: [
    {
      name: "else if chain on the same member",
      code: `
if (food.type === VEGETABLE) {
  return steam(food);
} else if (food.type === PROTEIN) {
  return grill(food);
} else {
  return food;
}
`.trim(),
      errors: [{ messageId: "preferSwitch" }],
    },
    {
      name: "consecutive ifs on the same member",
      code: `
if (food.type === VEGETABLE) {
  return steam(food);
}
if (food.type === PROTEIN) {
  return grill(food);
}
return food;
`.trim(),
      errors: [{ messageId: "preferSwitch" }],
    },
  ],
});
