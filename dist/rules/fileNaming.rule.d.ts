import type { Rule } from "eslint";
import { type NamingPolicy } from "./namingPolicy.js";
/** The runner passes each file's layer naming policy; the rule cannot be configured directly. */
export type FileNamingOptions = {
    readonly architecture?: NamingPolicy;
};
export declare const fileNamingRule: {
    readonly id: "file-naming";
    readonly options: import("../core/defineRule.js").RuleOptions<[FileNamingOptions?]>;
    readonly title: "Name files after one primary concept";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=fileNaming.rule.d.ts.map