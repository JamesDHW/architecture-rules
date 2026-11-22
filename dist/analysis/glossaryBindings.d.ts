import type { SourceFile } from "typescript/unstable/ast";
import type { Project, Type } from "typescript/unstable/sync";
import type { Architecture, GlossaryTerm } from "../config/types.js";
import type { ConfigText } from "./configurationChecks.js";
import type { OwnedName } from "./glossaryNames.js";
import type { ClassifiedFile, Issue } from "./inventory.js";
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
export declare const glossaryIssue: (ruleId: string, config: ConfigText, keys: readonly string[], message: string) => Issue;
type Bound = {
    readonly bindings: Bindings;
    readonly issues: readonly Issue[];
};
/** Finds the one declaration of each bound term's type; a type declared nowhere or twice is an issue in the configuration. */
export declare const resolveBindings: (architecture: Architecture, files: readonly GlossaryFile[], config: ConfigText) => Bound;
export {};
//# sourceMappingURL=glossaryBindings.d.ts.map