import { namedDivisibilityRule } from "../src/rules/namedDivisibility.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(namedDivisibilityRule, {
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
      name: "block-bodied helper",
      code: `
const isDivisibleBy = (value: number, divisor: number): boolean => {
  return value % divisor === 0;
};
`.trim(),
    },
    {
      name: "named remainder assigned to a predicate",
      code: "const isCenturyLeapYear = year % 400 === 0;\n",
    },
    {
      name: "unrelated comparison",
      code: "if (year === 400) return true;\n",
    },
  ],
  invalid: [
    {
      name: "inline remainder in if",
      code: "if (year % 400 === 0) return true;\n",
      errors: [{ messageId: "namedDivisibility" }],
    },
    {
      name: "negated remainder in if",
      code: "if (year % 100 !== 0) return true;\n",
      errors: [{ messageId: "namedDivisibility" }],
    },
    {
      name: "yoda remainder comparison",
      code: "if (0 === year % 400) return true;\n",
      errors: [{ messageId: "namedDivisibility" }],
    },
    {
      name: "remainder returned among other statements",
      code: `
const isLeapYear = (year: number): boolean => {
  if (isDivisibleBy(year, 400)) return true;
  return year % 4 === 0;
};
`.trim(),
      errors: [{ messageId: "namedDivisibility" }],
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
        { messageId: "namedDivisibility" },
        { messageId: "namedDivisibility" },
        { messageId: "namedDivisibility" },
      ],
    },
  ],
});
