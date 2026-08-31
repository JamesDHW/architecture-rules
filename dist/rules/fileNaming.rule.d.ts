import type { Rule } from "eslint";
export declare const fileNamingRule: {
    readonly id: "file-naming";
    readonly title: "Name files after one primary concept";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: readonly ["error", {
            readonly allow: {
                readonly entrypoints: readonly ["**/index.ts", "**/index.tsx"];
                readonly tests: readonly ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"];
                readonly framework: readonly ["**/page.tsx", "**/layout.tsx"];
            };
        }];
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=fileNaming.rule.d.ts.map