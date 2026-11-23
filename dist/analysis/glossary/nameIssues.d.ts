import type { Checker } from "typescript/unstable/sync";
import type { PhraseMatch } from "../../core/identifierWords.js";
import type { ClassifiedFile, Issue } from "../inventory.js";
import type { OwnedName } from "./names.js";
import { type JudgedType, type TermType } from "./types.js";
import { type Meaning, type ReadName, type Vocabulary } from "./vocabulary.js";
/** An issue about one name: where the name is declared, to the column. */
export type NameIssue = Issue & {
    readonly column?: number;
};
/** Each bound term's type as one project's checker sees it, by glossary:Term. */
export type TermTypes = ReadonlyMap<string, TermType>;
export type Context = {
    readonly file: ClassifiedFile;
    readonly checker: Checker;
    readonly termTypes: TermTypes;
    readonly vocabulary: Vocabulary;
    readonly match: "head" | "any";
    readonly types: boolean;
    readonly aliases: boolean;
};
export type Name = {
    readonly owned: OwnedName;
    readonly read: ReadName;
    readonly aliases: readonly PhraseMatch<Meaning>[];
};
/** Whether the name's type matters: it is a value, and a typed term or an alias of one appears where the checks read. */
export declare const needsType: (context: Context, name: Name) => boolean;
type Typed = {
    readonly judged: JudgedType;
    readonly text: string;
};
/** A name and, when its type was asked for, what the type says. */
type TypedName = {
    readonly name: Name;
    readonly typed: Typed | undefined;
};
export declare const aliasIssues: (context: Context, { name, typed }: TypedName) => readonly NameIssue[];
export declare const typeIssues: (context: Context, { name, typed }: TypedName) => readonly NameIssue[];
export {};
//# sourceMappingURL=nameIssues.d.ts.map