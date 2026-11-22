import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { rules } from "../rules/index.js";
/** The rules `architecture-check fix` can apply by itself. */
const commandFixes = {
    "file-naming": "architecture-check fix --rule file-naming",
    "no-deep-relative-imports": "architecture-check fix --rule no-deep-relative-imports",
};
/** How a rule is checked, in the words the catalogue uses rather than the engines' names. */
const kindOf = (rule) => {
    switch (rule.enforcement.type) {
        case "oxlint":
        case "custom-oxlint":
            return "lint";
        case "typescript":
            return "compiler";
        case "dead-code":
            return "dead code";
        case "glossary":
            return "glossary";
        case "configuration":
            return "configuration";
        case "advisory":
            return "advisory";
        case "architecture":
            return "structure";
    }
};
const defaultSetting = (rule) => {
    const { enforcement } = rule;
    if ("configuration" in enforcement)
        return enforcement.configuration;
    return enforcement.type === "architecture" ? "error, always" : undefined;
};
const lintFixable = (rule) => {
    const { enforcement } = rule;
    return enforcement.type === "custom-oxlint" && enforcement.implementation.meta?.fixable !== undefined;
};
const autofixOf = (rule) => {
    const command = commandFixes[rule.id];
    return { lintFix: lintFixable(rule), ...(command === undefined ? {} : { command }) };
};
const docsDirectory = fileURLToPath(new URL("../../docs/rules/", import.meta.url));
export const catalogueEntry = (rule) => ({
    id: rule.id,
    title: rule.title,
    kind: kindOf(rule),
    default: defaultSetting(rule),
    description: rule.description,
    ...(rule.instead === undefined ? {} : { instead: rule.instead }),
    ...(rule.suppressWhen === undefined ? {} : { exceptionWhen: rule.suppressWhen }),
    autofix: autofixOf(rule),
    docs: join(docsDirectory, `${rule.id}.md`),
});
export const ruleById = (id) => rules.find((rule) => rule.id === id);
/** Every rule, for an adoption agent mapping another linter's rules onto these. */
export const catalogue = () => rules.map(catalogueEntry);
//# sourceMappingURL=ruleCatalogue.js.map