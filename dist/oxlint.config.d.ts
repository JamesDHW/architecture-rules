declare const _default: {
    plugins: ("eslint" | "import" | "jsx-a11y" | "oxc" | "promise" | "react" | "typescript" | "unicorn")[];
    jsPlugins: {
        name: string;
        specifier: string;
    }[];
    options: {
        typeAware: true;
    };
    rules: {
        [k: string]: [import("./core/defineRule.js").Severity, ...unknown[]] | import("./core/defineRule.js").Severity;
    };
    overrides?: {
        files: string[];
        rules: {
            [k: string]: [import("./core/defineRule.js").Severity, ...unknown[]] | import("./core/defineRule.js").Severity;
        };
    }[];
};
export default _default;
//# sourceMappingURL=oxlint.config.d.ts.map