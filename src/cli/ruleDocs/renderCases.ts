import type { ArchitectureRule } from "../../core/defineRule.js";
import type { CaseOption, ExpectedFinding, InvalidCase, RuleCases, ValidCase } from "../../core/ruleCases.js";
import { fence, inlineCode } from "./markdown.js";

const ruleMessages = (rule: ArchitectureRule): Readonly<Record<string, string>> => {
  const { enforcement } = rule;
  return enforcement.type === "custom-oxlint" ? enforcement.implementation.meta?.messages ?? {} : {};
};

const fillPlaceholders = (template: string, placeholders: Readonly<Record<string, string>> | undefined): string => {
  return template.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, name: string) => placeholders?.[name] ?? placeholder);
};

/** The message a finding reports, as the rule words it. */
const findingText = (rule: ArchitectureRule, finding: ExpectedFinding): string => {
  if ("message" in finding) return finding.message;
  const template = ruleMessages(rule)[finding.messageId] ?? finding.messageId;
  return fillPlaceholders(template, finding.data);
};

const caseDetails = (filename: string | undefined, options: readonly CaseOption[] | undefined): readonly string[] => [
  ...(filename === undefined ? [] : [`File: ${inlineCode(filename)}`]),
  ...(options === undefined ? [] : [`Options: ${inlineCode(JSON.stringify(options))}`]),
];

const caseHeading = (name: string | undefined, details: readonly string[]): string => {
  const title = name === undefined ? [] : [`**${name}**`];
  return [...title, ...details].join(" · ");
};

const validCaseMarkdown = (testCase: ValidCase, lang: string): string => {
  if (typeof testCase === "string") return fence(testCase, lang);
  const heading = caseHeading(testCase.name, caseDetails(testCase.filename, testCase.options));
  return [heading, fence(testCase.code, lang)].filter((part) => part.length > 0).join("\n\n");
};

const invalidCaseMarkdown = (rule: ArchitectureRule, testCase: InvalidCase, lang: string): string => {
  const heading = caseHeading(testCase.name, caseDetails(testCase.filename, testCase.options));
  const reports = testCase.errors.map((finding) => `> ${findingText(rule, finding)}`);
  return [heading, fence(testCase.code, lang), ...new Set(reports)].filter((part) => part.length > 0).join("\n\n");
};

/** Every case of the rule's test suite, allowed cases first, as documentation examples. */
export const casesMarkdown = (rule: ArchitectureRule, caseSets: readonly RuleCases[]): readonly string[] => {
  const valid = caseSets.flatMap(({ lang = "ts", valid: cases }) => cases.map((testCase) => validCaseMarkdown(testCase, lang)));
  const invalid = caseSets.flatMap(({ lang = "ts", invalid: cases }) => cases.map((testCase) => invalidCaseMarkdown(rule, testCase, lang)));
  return [
    "## Examples",
    "These are the rule's test cases: the test suite checks every one.",
    "### Allowed",
    ...valid,
    "### Reported",
    ...invalid,
  ];
};
