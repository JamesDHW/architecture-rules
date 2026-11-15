import { fence, inlineCode } from "./markdown.js";
const ruleMessages = (rule) => {
    const { enforcement } = rule;
    return enforcement.type === "custom-oxlint" ? enforcement.implementation.meta?.messages ?? {} : {};
};
const fillPlaceholders = (template, placeholders) => {
    return template.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, name) => placeholders?.[name] ?? placeholder);
};
/** The message a finding reports, as the rule words it. */
const findingText = (rule, finding) => {
    if ("message" in finding)
        return finding.message;
    const template = ruleMessages(rule)[finding.messageId] ?? finding.messageId;
    return fillPlaceholders(template, finding.data);
};
const caseDetails = (filename, options) => [
    ...(filename === undefined ? [] : [`File: ${inlineCode(filename)}`]),
    ...(options === undefined ? [] : [`Options: ${inlineCode(JSON.stringify(options))}`]),
];
const caseHeading = (name, details) => {
    const title = name === undefined ? [] : [`**${name}**`];
    return [...title, ...details].join(" · ");
};
const validCaseMarkdown = (testCase, lang) => {
    if (typeof testCase === "string")
        return fence(testCase, lang);
    const heading = caseHeading(testCase.name, caseDetails(testCase.filename, testCase.options));
    return [heading, fence(testCase.code, lang)].filter((part) => part.length > 0).join("\n\n");
};
const invalidCaseMarkdown = (rule, testCase, lang) => {
    const heading = caseHeading(testCase.name, caseDetails(testCase.filename, testCase.options));
    const reports = testCase.errors.map((finding) => `> ${findingText(rule, finding)}`);
    return [heading, fence(testCase.code, lang), ...new Set(reports)].filter((part) => part.length > 0).join("\n\n");
};
/** Every case of the rule's test suite, allowed cases first, as documentation examples. */
export const casesMarkdown = (rule, caseSets) => {
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
//# sourceMappingURL=renderCases.js.map