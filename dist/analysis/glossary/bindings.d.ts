import type { SourceFile } from "typescript/unstable/ast";
import type { Project, Type } from "typescript/unstable/sync";
import type { Architecture, GlossaryTerm } from "../../config/types.js";
import type { ConfigText } from "../configurationChecks.js";
import type { OwnedName } from "./names.js";
import type { ClassifiedFile, Issue } from "../inventory.js";
/** A file that follows a glossary, parsed once: its project, syntax tree and the names it declares. */
export type GlossaryFile = {
    readonly file: ClassifiedFile;
    readonly project: Project;
    readonly source: SourceFile;
    readonly names: readonly OwnedName[];
};
/** A bound term's type: its declarations, and its symbol to ask each project for the type. No keys when not found once. */
type Binding = {
    readonly keys: readonly string[];
    readonly symbol?: NonNullable<ReturnType<Type["getSymbol"]>>;
};
/** Each bound term's type, by glossary and term: glossary:Term. */
export type Bindings = ReadonlyMap<string, Binding>;
export declare const bindingKey: (glossary: string, term: GlossaryTerm) => string;
/** An issue about the glossary configuration, at the line of the glossary or the term it is about. */
type IssueAt = {
    readonly ruleId: string;
    readonly config: ConfigText;
    readonly keys: readonly string[];
    readonly message: string;
};
export declare const glossaryIssue: ({ ruleId, config, keys, message }: IssueAt) => Issue;
type Bound = {
    readonly bindings: Bindings;
    readonly issues: readonly Issue[];
};
/** What the glossary checks read: the configuration, and every file that follows a glossary. */
export type GlossaryInput = {
    readonly architecture: Architecture;
    readonly files: readonly GlossaryFile[];
    readonly config: ConfigText;
};
/** Finds the one declaration of each bound term's type; a type declared nowhere or twice is an issue in the configuration. */
export declare const resolveBindings: ({ architecture, files, config }: GlossaryInput) => Bound;
export {};
//# sourceMappingURL=bindings.d.ts.map