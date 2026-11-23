import type { Node, SourceFile } from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";
import type { Architecture } from "../../config/types.js";
import type { ClassifiedFile } from "../inventory.js";
/** A classified file with the project and syntax tree the compiler built for it. */
export type ProgramFile = {
    readonly file: ClassifiedFile;
    readonly project: Project;
    readonly source: SourceFile;
};
/** What a program check reads: the architecture, the files to check and the compiler's projects. */
export type ProgramScope = {
    readonly architecture: Architecture;
    readonly files: readonly ClassifiedFile[];
    readonly projects: readonly Project[];
};
/** One problem a program check found, at the severity the file's layer sets. */
export type ProgramIssue = {
    readonly ruleId: string;
    readonly file: string;
    readonly line?: number;
    readonly severity: "error" | "warn";
    readonly message: string;
};
/** Which rule's setting to read, for which file. */
export type RuleLookup = {
    readonly file: ClassifiedFile;
    readonly ruleId: string;
};
/** The rule's severity for a file: its layer's, else the project's; undefined when the rule is off there. */
export declare const severityOf: (architecture: Architecture, lookup: RuleLookup) => "error" | "warn" | undefined;
/** The rule's first option object for a file, or an empty record. */
export declare const optionsOf: (architecture: Architecture, lookup: RuleLookup) => Readonly<Record<string, unknown>>;
/** Production source: shipped code that a person wrote, not tests, scripts, generated output or declarations. */
export declare const isProductionSource: (file: ClassifiedFile) => boolean;
/** Each file with its project and syntax tree; files the compiler does not hold are skipped. */
export declare const programFiles: (projects: readonly Project[], files: readonly ClassifiedFile[]) => readonly ProgramFile[];
/** The 1-based line a node starts on. */
export declare const lineOf: (source: SourceFile, node: Node) => number;
//# sourceMappingURL=programFile.d.ts.map