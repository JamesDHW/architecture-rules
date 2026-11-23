import { type Phrase, type PhraseMatch } from "../../core/identifierWords.js";
import type { Architecture, GlossaryTerm, TermPhrase } from "../../config/types.js";
/** What a phrase found in a name means: a glossary's term, or a word it avoids for that term. */
export type Meaning = {
    readonly glossary: string;
    readonly term: GlossaryTerm;
    readonly alias?: TermPhrase;
};
export type Vocabulary = readonly Phrase<Meaning>[];
/** Every term and avoided alias of the glossaries a layer follows, as phrases to find in names. */
export declare const vocabularyOf: (architecture: Architecture, glossaries: readonly string[]) => Vocabulary;
/** How a name was read: its words, and the phrases that matter for each check. */
export type ReadName = {
    /** The name as written. */
    readonly text: string;
    readonly words: readonly string[];
    /** Every phrase in the name, longest first at each position. */
    readonly all: readonly PhraseMatch<Meaning>[];
    /** The phrase that ends the name, if any: what the name names. */
    readonly head?: PhraseMatch<Meaning>;
};
export declare const readName: (text: string, vocabulary: Vocabulary) => ReadName;
/** The name with the matched phrase replaced by the term's words, keeping a plural plural: clients becomes customers. */
export declare const renamed: (read: ReadName, match: PhraseMatch<Meaning>) => string;
/** Whether the name is about its head rather than one: isCodeFinding is a boolean, inLayers a selection. */
export declare const isAboutHead: (read: ReadName) => boolean;
/** A term's definition as a sentence. */
export declare const definitionOf: (term: GlossaryTerm) => string;
//# sourceMappingURL=vocabulary.d.ts.map