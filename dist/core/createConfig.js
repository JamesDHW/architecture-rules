import { defineConfig } from "oxlint";
import { rules } from "../rules/index.js";
const getOxlintRuleName = (rule) => {
    if (rule.enforcement.type === "oxlint") {
        return rule.enforcement.rule;
    }
    if (rule.enforcement.type !== "custom-oxlint") {
        return undefined;
    }
    return `architecture/${rule.id}`;
};
const toMutableConfiguration = (configuration) => {
    if (typeof configuration === "string") {
        return configuration;
    }
    return [configuration[0], ...configuration.slice(1)];
};
const withSeverity = (configuration, severity) => {
    if (severity === "off") {
        return "off";
    }
    if (typeof configuration === "string") {
        return severity;
    }
    return [severity, ...configuration.slice(1)];
};
const toOverrideConfiguration = (configuration, override) => {
    if (typeof override === "string") {
        return withSeverity(configuration, override);
    }
    if ("severity" in override) {
        return withSeverity(configuration, override.severity);
    }
    return [override[0], ...override.slice(1)];
};
const toOxlintEntry = (rule, override) => {
    const oxlintRuleName = getOxlintRuleName(rule);
    if (oxlintRuleName === undefined) {
        return undefined;
    }
    if (rule.enforcement.type !== "oxlint" && rule.enforcement.type !== "custom-oxlint") {
        return undefined;
    }
    if (override === undefined) {
        return [oxlintRuleName, toMutableConfiguration(rule.enforcement.configuration)];
    }
    return [
        oxlintRuleName,
        toOverrideConfiguration(rule.enforcement.configuration, override),
    ];
};
const findRule = (architectureRuleId) => {
    return rules.find((candidate) => candidate.id === architectureRuleId);
};
export const createConfig = (options = {}) => {
    const configuredRules = Object.fromEntries(rules.flatMap((rule) => {
        const entry = toOxlintEntry(rule, options.rules?.[rule.id]);
        if (entry === undefined) {
            return [];
        }
        return [entry];
    }));
    const overrides = options.overrides?.map((override) => ({
        files: [...override.files],
        rules: Object.fromEntries(Object.entries(override.rules).flatMap(([architectureRuleId, ruleOverride]) => {
            const rule = findRule(architectureRuleId);
            if (rule === undefined) {
                return [];
            }
            const entry = toOxlintEntry(rule, ruleOverride);
            if (entry === undefined) {
                return [];
            }
            return [entry];
        })),
    }));
    return defineConfig({
        plugins: [
            "eslint",
            "typescript",
            "unicorn",
            "oxc",
            "import",
            "react",
            "jsx-a11y",
            "promise",
        ],
        jsPlugins: [
            {
                name: "architecture",
                specifier: options.pluginSpecifier ?? "architecture-rules/plugin",
            },
        ],
        options: {
            typeAware: true,
        },
        rules: configuredRules,
        ...(overrides === undefined ? {} : { overrides }),
    });
};
//# sourceMappingURL=createConfig.js.map