import type { Rule } from "eslint";
export type FilenameCase = "pascal" | "camel" | "pascalOrCamel";
export type FileNamingOptions = {
    readonly allow?: Readonly<Record<string, readonly string[]>>;
    readonly banned?: readonly string[];
    readonly suffixes?: Readonly<Record<string, FilenameCase>>;
};
export declare const fileNamingRule: {
    readonly id: "file-naming";
    readonly title: "Name files after one primary concept";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=fileNaming.rule.d.ts.map