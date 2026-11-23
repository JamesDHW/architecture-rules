import { type MaxDirectoryFilesOptions } from "./maxDirectoryFiles.constants.js";
export type { MaxDirectoryFilesOptions } from "./maxDirectoryFiles.constants.js";
export declare const maxDirectoryFilesWarnRule: {
    readonly id: "max-directory-files-warn";
    readonly options: import("../core/defineRule.js").RuleOptions<[Partial<MaxDirectoryFilesOptions>?]>;
    readonly title: "Warn when a directory holds more than 15 source files";
    readonly description: string;
    readonly instead: "Move files that share a concept into a subfolder named after it.";
    readonly suppressWhen: "A line comment cannot cover a directory. When a flat folder is the framework's contract, set the layer's limit with a reason.";
    readonly enforcement: {
        readonly type: "program";
        readonly configuration: readonly ["warn", {
            readonly max: 15;
        }];
    };
};
export declare const maxDirectoryFilesRule: {
    readonly id: "max-directory-files";
    readonly options: import("../core/defineRule.js").RuleOptions<[Partial<MaxDirectoryFilesOptions>?]>;
    readonly title: "Limit directories to 30 source files";
    readonly description: string;
    readonly instead: "Move files that share a concept into a subfolder named after it.";
    readonly suppressWhen: "A line comment cannot cover a directory. When a flat folder is the framework's contract, set the layer's limit with a reason.";
    readonly enforcement: {
        readonly type: "program";
        readonly configuration: readonly ["error", {
            readonly max: 30;
        }];
    };
};
//# sourceMappingURL=maxDirectoryFiles.rule.d.ts.map