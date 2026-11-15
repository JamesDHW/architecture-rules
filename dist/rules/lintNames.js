/** The name the Oxlint config and suppression comments use for a lint rule, such as architecture/no-let; undefined when the rule is not a lint rule. */
export const lintRuleName = (rule) => {
    const { enforcement } = rule;
    switch (enforcement.type) {
        case "oxlint":
            return enforcement.rule.includes("/") ? enforcement.rule : `eslint/${enforcement.rule}`;
        case "custom-oxlint":
            return `architecture/${rule.id}`;
        case "typescript":
        case "advisory":
        case "dead-code":
        case "configuration":
        case "architecture":
            return undefined;
    }
};
/** How Oxlint labels a lint rule's findings: architecture/no-let becomes architecture(no-let). */
export const diagnosticCode = (lintName) => {
    const [plugin, ...name] = lintName.split("/");
    return `${plugin ?? ""}(${name.join("/")})`;
};
/** Lint and dead-code rules can be excepted on a line; structural, configuration and compiler checks always apply. */
export const isExceptable = (rule) => {
    switch (rule.enforcement.type) {
        case "oxlint":
        case "custom-oxlint":
        case "dead-code":
            return true;
        case "typescript":
        case "advisory":
        case "configuration":
        case "architecture":
            return false;
    }
};
//# sourceMappingURL=lintNames.js.map