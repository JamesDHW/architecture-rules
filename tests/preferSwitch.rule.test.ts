import { preferSwitchRule } from "../src/rules/preferSwitch.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(preferSwitchRule, {
  valid: [
    { name: "independent effects may change the discriminant", code: 'if (project.status === "draft") publish(project); if (project.status === "active") notify(project);' },
    { name: "loose equality is not switch equality", code: 'if (status == 0) return pending; if (status == 1) return ready;' },
    { name: "computed property access may perform work", code: 'if (project[getKey()] === "draft") return pending; if (project[getKey()] === "active") return ready;' },
    { name: "intervening work must not be moved", code: 'if (status === "draft") return pending; refresh(); if (status === "active") return ready;' },

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

runCustomRule(preferSwitchRule, {
  valid: [
    'const ProjectPage = () => { if (project.status === "loading") return <Loading />; if (project.status === "failure") return <Failure />; return <Project />; };',
  ],
  invalid: [],
}, "tsx");
