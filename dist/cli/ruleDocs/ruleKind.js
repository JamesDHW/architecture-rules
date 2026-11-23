import { lintRuleName } from "../../rules/lintNames.js";
import { inlineCode } from "./markdown.js";
/** What enforces the rule, in a few words. */
export const enforcementLabel = (rule) => {
    const { enforcement } = rule;
    switch (enforcement.type) {
        case "custom-oxlint":
            return "Lint rule";
        case "oxlint":
            return `Lint rule, built on ${inlineCode(lintRuleName(rule) ?? enforcement.rule)}`;
        case "typescript":
            return `TypeScript compiler options ${inlineCode(JSON.stringify(enforcement.compilerOptions))}`;
        case "dead-code":
            return enforcement.scope === "file" ? "Dead-code check" : "Dead-code check, set project-wide";
        case "program":
            return "Program check, with type information";
        case "glossary":
            return "Glossary check, in layers that follow a glossary";
        case "configuration":
            return "Configuration check, set project-wide";
        case "architecture":
            return "Structural check; lint comments cannot suppress it";
        case "advisory":
            return "Advisory; nothing checks it automatically";
    }
};
const settingLabel = (configuration) => {
    if (typeof configuration === "string")
        return `${configuration} by default`;
    const [severity, ...options] = configuration;
    return `${severity} by default, with options ${inlineCode(JSON.stringify(options))}`;
};
/** The rule's default severity and options, for lint rules. */
export const defaultSetting = (rule) => {
    const { enforcement } = rule;
    switch (enforcement.type) {
        case "custom-oxlint":
        case "oxlint":
        case "dead-code":
        case "program":
        case "glossary":
        case "configuration":
            return settingLabel(enforcement.configuration);
        case "typescript":
        case "architecture":
        case "advisory":
            return undefined;
    }
};
//# sourceMappingURL=ruleKind.js.map