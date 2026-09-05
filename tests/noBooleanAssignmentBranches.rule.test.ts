import { noBooleanAssignmentBranchesRule } from "../src/rules/noBooleanAssignmentBranches.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(noBooleanAssignmentBranchesRule, {
  valid: [
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
      name: "assign the boolean expression",
      code: "enabled = shouldEnable;\n",
    },
    {
      name: "branch does more than assign a boolean",
      code: `
if (shouldEnable) {
  enabled = true;
  startSync();
}
`.trim(),
    },
  ],
  invalid: [
    {
      name: "if assigns true",
      code: `
if (shouldEnable) {
  enabled = true;
}
`.trim(),
      errors: [{ messageId: "booleanAssignment" }],
    },
    {
      name: "if else assigns true and false",
      code: `
if (shouldEnable) {
  enabled = true;
} else {
  enabled = false;
}
`.trim(),
      errors: [
        { messageId: "booleanAssignment" },
        { messageId: "booleanAssignment" },
      ],
    },
    {
      name: "messy leap year",
      code: `
const isLeapYear = (year: number): boolean => {
  let result: boolean;

  if (year % 400 === 0) {
    result = true;
  } else if (year % 4 === 0) {
    if (year % 100 !== 0) {
      result = true;
    } else {
      result = false;
    }
  } else {
    result = false;
  }

  return result;
};
`.trim(),
      errors: [
        { messageId: "booleanAssignment" },
        { messageId: "booleanAssignment" },
        { messageId: "booleanAssignment" },
        { messageId: "booleanAssignment" },
      ],
    },
  ],
});
