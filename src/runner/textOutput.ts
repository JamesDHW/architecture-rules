import type { Finding } from "./findings.js";
import type { RuleGuidance } from "./ruleGuidance.js";

const location = ({ file, line, column }: Finding): string => {
  return `${file}${line === undefined ? "" : `:${line}`}${column === undefined ? "" : `:${column}`}`;
};

const findingLine = (finding: Finding): string => {
  switch (finding.source) {
    case "lint":
      return `${location(finding)}: ${finding.severity} ${finding.code ?? finding.ruleId}: ${finding.message}`;
    case "structure":
    case "compiler":
      return `${location(finding)}: ${finding.ruleId}: ${finding.message}`;
  }
};

const guidanceLines = ({ ruleId, instead, docs }: RuleGuidance): readonly string[] => {
  return [`  ${ruleId}: ${instead ?? "see the rule's page"}`, `    ${docs}`];
};

/** Lint findings and the fix guidance go to stdout; structural and compiler findings to stderr. */
export const printText = (findings: readonly Finding[], guidance: readonly RuleGuidance[]): void => {
  for (const finding of findings) {
    const stream = finding.source === "lint" ? process.stdout : process.stderr;
    stream.write(`${findingLine(finding)}\n`);
  }
  if (guidance.length === 0) return;
  process.stdout.write(`\nHow to fix:\n${guidance.flatMap(guidanceLines).join("\n")}\n`);
};

/** One JSON document with every finding and the guidance for the rules that reported them. */
export const printJson = (findings: readonly Finding[], guidance: readonly RuleGuidance[]): void => {
  process.stdout.write(`${JSON.stringify({ findings, rules: guidance }, null, 2)}\n`);
};
