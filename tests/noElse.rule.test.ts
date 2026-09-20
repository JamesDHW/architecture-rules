import { noElseRule } from "../src/rules/noElse.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noElseRule, {
  valid: [
    {
      name: "exclusive effects extracted before shared work",
      code: `
const notifyProjectMembers = (project: Project): void => {
  sendProjectStatusNotification(project);
  recordNotificationDelivery(project.id);
};
const sendProjectStatusNotification = (project: Project): void => {
  if (project.isArchived) {
    sendArchiveNotification(project);
    return;
  }
  sendActiveNotification(project);
};
`.trim(),
    },
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
      name: "guard clauses without else",
      code: `
if (token.hasExpired()) {
  return loginPageResponse();
}

if (!hasAccess(token)) {
  return accessDeniedResponse();
}

return homepageResponse();
`.trim(),
    },
  ],
  invalid: [
    {
      name: "nonterminal exclusive effects before shared work",
      code: `
const notifyProjectMembers = (project: Project): void => {
  if (project.isArchived) {
    sendArchiveNotification(project);
  } else {
    sendActiveNotification(project);
  }
  recordNotificationDelivery(project.id);
};
`.trim(),
      errors: [{ messageId: "noElse" }],
    },
    {
      name: "else after if",
      code: `
if (isReady) {
  start();
} else {
  wait();
}
`.trim(),
      errors: [{ messageId: "noElse" }],
    },
    {
      name: "else if chain",
      code: `
if (year % 400 === 0) {
  return true;
} else if (year % 4 === 0) {
  return year % 100 !== 0;
} else {
  return false;
}
`.trim(),
      errors: [{ messageId: "noElse" }, { messageId: "noElse" }],
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
        { messageId: "noElse" },
        { messageId: "noElse" },
        { messageId: "noElse" },
      ],
    },
  ],
});
