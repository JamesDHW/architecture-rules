import { type MinFileSubstanceOptions } from "./minFileSubstance.constants.js";
export type { MinFileSubstanceOptions } from "./minFileSubstance.constants.js";
export declare const minFileSubstanceRule: {
    readonly id: "min-file-substance";
    readonly options: import("../core/defineRule.js").RuleOptions<[Partial<MinFileSubstanceOptions>?]>;
    readonly title: "Merge tiny files into their only importer";
    readonly description: string;
    readonly instead: "Move the file's contents into the one file that imports it, and delete the file.";
    readonly suppressWhen: "The file is a deliberate seam, such as a port type another package will implement.";
    readonly enforcement: {
        readonly type: "program";
        readonly configuration: readonly ["warn", {
            readonly maxStatements: 3;
            readonly maxLines: 10;
            readonly ignore: readonly ["**/*.constants.ts", "**/*.state.ts"];
        }];
    };
};
//# sourceMappingURL=minFileSubstance.rule.d.ts.map