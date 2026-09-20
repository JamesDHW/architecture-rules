import { fileURLToPath } from "node:url";
import { posix } from "./paths.js";
import { rules } from "../rules/index.js";
/** Compiles disjoint policies for the runner's child-directory config (pinned Oxlint path semantics). */
export const compileOxlintConfig = (files, imports) => ({
    categories: { correctness: "off" },
    plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "react", "jsx-a11y", "promise"],
    jsPlugins: [{ name: "architecture", specifier: fileURLToPath(new URL("../plugin.js", import.meta.url)) }],
    options: { typeAware: true },
    overrides: files.map((file) => {
        const configured = {};
        for (const rule of rules) {
            const enforcement = rule.enforcement;
            if (enforcement.type !== "oxlint" && enforcement.type !== "custom-oxlint")
                continue;
            const name = enforcement.type === "oxlint" ? enforcement.rule : `architecture/${rule.id}`;
            const setting = file.policy.rules[rule.id];
            if (setting !== undefined)
                configured[name] = [setting.severity, ...setting.options];
        }
        configured["architecture/file-naming"] = file.policy.naming === undefined ? "off" : ["error", { architecture: file.policy.naming }];
        configured["architecture/allowed-imports"] = ["error", { issues: imports.filter((issue) => issue.file === file.relative).map(({ line, column, message }) => ({ line, column, message })) }];
        // Glob metacharacters in real filenames must not turn exact selection into a pattern.
        const escaped = posix(file.path).replace(/[\[\]*?{}()!]/g, (character) => `[${character}]`);
        return { files: [escaped], rules: configured };
    }),
});
//# sourceMappingURL=compileOxlintConfig.js.map