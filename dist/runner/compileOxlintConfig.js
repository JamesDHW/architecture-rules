import { fileURLToPath } from "node:url";
import { configurationFile, posix } from "../analysis/paths.js";
import { rules } from "../rules/index.js";
const lintRuleName = (rule) => {
    const { enforcement } = rule;
    switch (enforcement.type) {
        case "oxlint":
            return enforcement.rule;
        case "custom-oxlint":
            return `architecture/${rule.id}`;
        case "typescript":
        case "advisory":
        case "architecture":
            return undefined;
    }
};
const policyRules = (file) => Object.fromEntries(rules.flatMap((rule) => {
    const name = lintRuleName(rule);
    const setting = file.policy.rules[rule.id];
    const isConfigured = name !== undefined && setting !== undefined;
    if (!isConfigured)
        return [];
    // Tools load configuration files such as vite.config.ts from their default export.
    const isExemptExport = rule.id === "named-exports" && configurationFile(file.path);
    return [[name, isExemptExport ? "off" : [setting.severity, ...setting.options]]];
}));
const fileRules = (file, imports) => ({
    ...policyRules(file),
    "architecture/file-naming": file.policy.naming === undefined ? "off" : ["error", { architecture: file.policy.naming }],
    "architecture/allowed-imports": ["error", {
            issues: imports.filter((issue) => issue.file === file.relative).map(({ line, column, message }) => ({ line, column, message })),
        }],
});
/** Glob metacharacters in real filenames must not turn exact selection into a pattern. */
const exactSelector = (path) => posix(path).replace(/[[\]*?{}()!]/g, (character) => `[${character}]`);
/** Compiles disjoint policies for the runner's child-directory config (pinned Oxlint path semantics).
 * Generated files never reach this point; the runner checks only their names and imports. */
export const compileOxlintConfig = (files, imports) => ({
    categories: { correctness: "off" },
    plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "react", "jsx-a11y", "promise"],
    jsPlugins: [{ name: "architecture", specifier: fileURLToPath(new URL("../plugin.js", import.meta.url)) }],
    options: { typeAware: true },
    overrides: files.map((file) => ({ files: [exactSelector(file.path)], rules: fileRules(file, imports) })),
});
//# sourceMappingURL=compileOxlintConfig.js.map