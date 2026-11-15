import { inlineCode, tableCell } from "./markdown.js";
import { GENERATED_NOTICE } from "./ruleDocs.constants.js";
import { defaultSetting, enforcementLabel } from "./ruleKind.js";
const indexRow = (rule) => {
    const link = `[${inlineCode(rule.id)}](${rule.id}.md)`;
    return `| ${link} | ${tableCell(rule.title)} | ${tableCell(enforcementLabel(rule))} | ${tableCell(defaultSetting(rule) ?? "")} |`;
};
/** The table of every rule, linking to each rule's page. */
export const renderRuleIndex = (rules) => {
    const rows = rules.toSorted((left, right) => left.id.localeCompare(right.id)).map(indexRow);
    return [
        GENERATED_NOTICE,
        "# Rules",
        "Each page explains one rule: why it exists, what to write instead, when a suppression is justified, known workarounds to avoid, and its test cases as examples.",
        "| Rule | Title | Checked by | Default |\n| --- | --- | --- | --- |\n" + rows.join("\n"),
    ].join("\n\n").concat("\n");
};
//# sourceMappingURL=renderRuleIndex.js.map