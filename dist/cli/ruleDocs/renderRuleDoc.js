import { lintRuleName } from "../../rules/lintNames.js";
import { casesMarkdown } from "./renderCases.js";
import { descriptionMarkdown, fence, inlineCode } from "./markdown.js";
import { defaultSetting, enforcementLabel } from "./ruleKind.js";
import { GENERATED_NOTICE } from "./ruleDocs.constants.js";
const insteadSection = (rule) => {
    return rule.instead === undefined ? [] : ["## What to write instead", rule.instead];
};
const suppressionSection = (rule) => {
    const name = lintRuleName(rule);
    if (name === undefined)
        return [];
    const comment = fence(`// oxlint-disable-next-line ${name} -- <the concrete reason this line needs it>`, "ts");
    const when = rule.suppressWhen ?? "Only when complying would make the code worse, and the reason can be stated concretely.";
    return ["## When to suppress", when, comment];
};
const evasionMarkdown = (evasion) => {
    const verdict = evasion.caughtBy === undefined
        ? "No rule reports this; review has to catch it."
        : `Reported by [${inlineCode(evasion.caughtBy)}](${evasion.caughtBy}.md).`;
    return [`### ${evasion.name}`, fence(evasion.code, evasion.lang ?? "ts"), evasion.why, verdict].join("\n\n");
};
const evasionSection = (rule) => {
    const evasions = rule.evasions ?? [];
    if (evasions.length === 0)
        return [];
    return ["## Workarounds to avoid", "Code like this satisfies the rule's wording while missing its point.", ...evasions.map(evasionMarkdown)];
};
/** One rule's documentation page. */
export const renderRuleDoc = (rule, caseSets) => {
    const setting = defaultSetting(rule);
    const facts = [inlineCode(rule.id), enforcementLabel(rule), ...(setting === undefined ? [] : [setting])].join(" · ");
    const sections = [
        GENERATED_NOTICE,
        `# ${rule.title}`,
        facts,
        descriptionMarkdown(rule.description),
        ...insteadSection(rule),
        ...suppressionSection(rule),
        ...evasionSection(rule),
        ...(caseSets.length === 0 ? [] : casesMarkdown(rule, caseSets)),
    ];
    return `${sections.join("\n\n")}\n`;
};
//# sourceMappingURL=renderRuleDoc.js.map