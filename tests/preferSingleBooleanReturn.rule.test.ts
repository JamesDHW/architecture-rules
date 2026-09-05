import { preferSingleBooleanReturnRule } from "../src/rules/preferSingleBooleanReturn.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(preferSingleBooleanReturnRule, {
  valid: [
    { name: "branch performs work before returning", code: 'if (isReady) { recordAccess(); return true; } return false;' },

    {
      name: "preferred leap year",
      code: `
const isDivisibleBy = (value: number, divisor: number): boolean =>
  value % divisor === 0;

const isLeapYear = (year: number): boolean => {
  if (isDivisibleBy(year, 400)) return true;
  if (isDivisibleBy(year, 100)) return false;
  return isDivisibleBy(year, 4);
};
`.trim(),
    },
    {
      name: "early true then a non-literal return",
      code: `
if (isAdmin) return true;
return hasAccess(user);
`.trim(),
    },
    {
      name: "same literal is not a true/false detour",
      code: `
if (isReady) return true;
return true;
`.trim(),
    },
  ],
  invalid: [
    { name: "boolean tail in switch case", code: 'const check = () => { switch (status) { case "ready": if (isMember) return true; return false; default: return canAccess(); } };', errors: [{ messageId: "booleanTail" }] },

    {
      name: "if true then return false",
      code: `
if (isReady) return true;
return false;
`.trim(),
      errors: [{ messageId: "booleanTail" }],
    },
    {
      name: "if false then return true",
      code: `
if (isBlocked) {
  return false;
}
return true;
`.trim(),
      errors: [{ messageId: "booleanTail" }],
    },
    {
      name: "if else returning opposite booleans",
      code: `
if (isReady) {
  return true;
} else {
  return false;
}
`.trim(),
      errors: [{ messageId: "booleanTail" }],
    },
    {
      name: "nested leftover after flattening else",
      code: `
if (isDivisibleBy(year, 400)) return true;
if (isDivisibleBy(year, 4)) {
  if (!isDivisibleBy(year, 100)) return true;
  return false;
}
return false;
`.trim(),
      errors: [{ messageId: "booleanTail" }],
    },
  ],
});
