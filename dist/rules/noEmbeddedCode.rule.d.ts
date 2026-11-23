import type { Rule } from "eslint";
export declare const noEmbeddedCodeRule: {
    readonly id: "no-embedded-code";
    readonly title: "Keep code and markup out of strings";
    readonly description: string;
    readonly instead: "Move the script, markup or style into a file of its own language, or use a tagged template that names the language.";
    readonly suppressWhen: "Prose or test data only looks like code, or a platform API takes code as a string and no file can be loaded instead.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noEmbeddedCode.rule.d.ts.map