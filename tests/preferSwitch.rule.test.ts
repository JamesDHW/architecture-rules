import { preferSwitchRule } from "../src/rules/preferSwitch.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(preferSwitchRule, {
  valid: [
    {
      name: "independent effects may change the discriminant",
      code: 'if (project.status === "draft") publish(project); if (project.status === "active") notify(project);',
    },
    {
      name: "loose equality is not switch equality",
      code: "if (status == 0) return pending; if (status == 1) return ready;",
    },
    {
      name: "computed property access may perform work",
      code: 'if (project[getKey()] === "draft") return pending; if (project[getKey()] === "active") return ready;',
    },
    {
      name: "intervening work must not be moved",
      code: 'if (status === "draft") return pending; refresh(); if (status === "active") return ready;',
    },

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
    {
      name: "a member discriminant outranks the identifier compared with it",
      code: "const choose = () => { if (a === a.b) return 1; if (a === a.c) return 2; };",
    },
    {
      name: "optional member access is not a discriminant",
      code: "const choose = () => { if (a?.b === 1) return 1; if (a?.b === 2) return 2; };",
    },
    {
      name: "a nonterminal branch disqualifies its whole run",
      code: "const choose = () => { if (s === 1) return 1; if (s === 2) refresh(); if (s === 3) return 3; if (s === 4) return 4; };",
    },
    {
      name: "an else chain ending in a nonterminal branch",
      code: "const choose = () => { if (s === 1) return 1; else if (s === 2) return 2; else if (s === 3) { refresh(); } };",
    },
  ],
  invalid: [
    {
      name: "literal before the discriminant",
      code: "const choose = () => { if (VEGETABLE === food.type) return steam(food); if (PROTEIN === food.type) return grill(food); };",
      errors: [{ messageId: "preferSwitch" }],
    },
    {
      name: "throw is a terminal branch",
      code: 'const choose = () => { if (status === "a") return 1; if (status === "b") throw failure; };',
      errors: [{ messageId: "preferSwitch" }],
    },
    {
      name: "a run may start after an if with else",
      code: "const choose = () => { if (s === 1) return 1; else refresh(); if (s === 2) return 2; if (s === 3) return 3; };",
      errors: [{ messageId: "preferSwitch" }],
    },
    {
      name: "an else chain and a following run are reported separately",
      code: "const choose = () => { if (s === 1) return 1; else if (s === 2) return 2; if (s === 3) return 3; if (s === 4) return 4; };",
      errors: [{ messageId: "preferSwitch" }, { messageId: "preferSwitch" }],
    },
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

runCustomRule(
  preferSwitchRule,
  {
    valid: [
      'const ProjectPage = () => { if (project.status === "loading") return <Loading />; if (project.status === "failure") return <Failure />; return <Project />; };',
    ],
    invalid: [],
  },
  "tsx",
);
