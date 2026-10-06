import type { Issue } from "../analysis/inventory.js";

export const printIssues = (issues: readonly Issue[]): void => {
  for (const issue of issues) {
    process.stderr.write(`${issue.file}${issue.line === undefined ? "" : `:${issue.line}`}: ${issue.ruleId}: ${issue.message}\n`);
  }
};
