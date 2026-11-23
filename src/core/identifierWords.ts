/**
 * The lower-case words of an identifier or file name, whatever its case: customerId and customer-id are customer,
 * id; HTTPClient is http, client; LINE_ITEMS is line, items. Digits stay with the word before them: base64Url is
 * base64, url.
 */
export const wordsOf = (name: string): readonly string[] => name
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
  .split(/[^A-Za-z0-9]+/)
  .filter((word) => word.length > 0)
  .map((word) => word.toLowerCase());

/** A word and its regular plurals: customer, customers; address, addresses; category, categories. */
const formsOf = (word: string): readonly string[] => [
  word, `${word}s`, `${word}es`,
  ...(/[^aeiou]y$/.test(word) ? [`${word.slice(0, -1)}ies`] : []),
];

/** Whether a word of a name is the word of a phrase, or its regular plural. Irregular plurals are not recognised. */
const isFormOf = (word: string, phraseWord: string): boolean => formsOf(phraseWord).includes(word);

/** Whether two phrases name the same thing: the same words, either singular or plural. */
export const isSamePhrase = (left: readonly string[], right: readonly string[]): boolean => {
  return left.length === right.length && left.every((word, index) => {
    const other = right[index] ?? "";
    return isFormOf(word, other) || isFormOf(other, word);
  });
};

/** A phrase to look for in names, such as a glossary term's words or an avoided alias's, with what it stands for. */
export type Phrase<Meaning> = { readonly words: readonly string[]; readonly meaning: Meaning };

/** Where a phrase was found among a name's words: from start up to, but not including, end. */
export type PhraseMatch<Meaning> = { readonly start: number; readonly end: number; readonly phrase: Phrase<Meaning> };

/** Whether the words start with the phrase. */
const startsWith = <Meaning>(words: readonly string[], phrase: Phrase<Meaning>): boolean => {
  const fits = phrase.words.length <= words.length;
  return fits && phrase.words.every((phraseWord, offset) => isFormOf(words[offset] ?? "", phraseWord));
};

/** The longest phrase the words start with. */
const longestStart = <Meaning>(words: readonly string[], phrases: readonly Phrase<Meaning>[]): Phrase<Meaning> | undefined => {
  const found = phrases.filter((phrase) => startsWith(words, phrase));
  return found.toSorted((left, right) => right.words.length - left.words.length).at(0);
};

/**
 * Every phrase in the words, read left to right, taking the longest phrase at each position. So with the phrases
 * "api client" and "client", apiClient is one match of "api client", never "client": a longer term owns its words.
 */
export const phraseMatches = <Meaning>(words: readonly string[], phrases: readonly Phrase<Meaning>[]): readonly PhraseMatch<Meaning>[] => {
  const from = (start: number): readonly PhraseMatch<Meaning>[] => {
    if (start >= words.length) return [];
    const phrase = longestStart(words.slice(start), phrases);
    if (phrase === undefined) return from(start + 1);
    return [{ start, end: start + phrase.words.length, phrase }, ...from(start + phrase.words.length)];
  };
  return from(0);
};

/**
 * The words that name what a name is: all of them, up to a trailing "by" clause. In English compounds the last
 * word is the thing and earlier words qualify it, so clientOrders is orders and customersById is customers.
 */
const headWords = (words: readonly string[]): readonly string[] => {
  const by = words.lastIndexOf("by");
  return by > 0 ? words.slice(0, by) : words;
};

/** The phrase that ends a name, the head noun of a compound, if one of the phrases ends it. */
export const headMatch = <Meaning>(words: readonly string[], phrases: readonly Phrase<Meaning>[]): PhraseMatch<Meaning> | undefined => {
  const head = headWords(words);
  return phraseMatches(head, phrases).find((match) => match.end === head.length);
};
