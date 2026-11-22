/**
 * The lower-case words of an identifier or file name, whatever its case: customerId and customer-id are customer,
 * id; HTTPClient is http, client; LINE_ITEMS is line, items. Digits stay with the word before them: base64Url is
 * base64, url.
 */
export declare const wordsOf: (name: string) => readonly string[];
/** Whether two phrases name the same thing: the same words, either singular or plural. */
export declare const isSamePhrase: (left: readonly string[], right: readonly string[]) => boolean;
/** A phrase to look for in names, such as a glossary term's words or an avoided alias's, with what it stands for. */
export type Phrase<Meaning> = {
    readonly words: readonly string[];
    readonly meaning: Meaning;
};
/** Where a phrase was found among a name's words: from start up to, but not including, end. */
export type PhraseMatch<Meaning> = {
    readonly start: number;
    readonly end: number;
    readonly phrase: Phrase<Meaning>;
};
/**
 * Every phrase in the words, read left to right, taking the longest phrase at each position. So with the phrases
 * "api client" and "client", apiClient is one match of "api client", never "client": a longer term owns its words.
 */
export declare const phraseMatches: <Meaning>(words: readonly string[], phrases: readonly Phrase<Meaning>[]) => readonly PhraseMatch<Meaning>[];
/** The phrase that ends a name, the head noun of a compound, if one of the phrases ends it. */
export declare const headMatch: <Meaning>(words: readonly string[], phrases: readonly Phrase<Meaning>[]) => PhraseMatch<Meaning> | undefined;
//# sourceMappingURL=identifierWords.d.ts.map