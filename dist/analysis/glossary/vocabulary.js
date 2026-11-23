import { headMatch, phraseMatches, wordsOf } from "../../core/identifierWords.js";
/** Every term and avoided alias of the glossaries a layer follows, as phrases to find in names. */
export const vocabularyOf = (architecture, glossaries) => glossaries.flatMap((glossary) => {
    return (architecture.glossaries[glossary]?.terms ?? []).flatMap((term) => [
        { words: term.words, meaning: { glossary, term } },
        ...term.avoid.map((alias) => ({ words: alias.words, meaning: { glossary, term, alias } })),
    ]);
});
export const readName = (text, vocabulary) => {
    const words = wordsOf(text);
    const head = headMatch(words, vocabulary);
    return { text, words, all: phraseMatches(words, vocabulary), ...(head === undefined ? {} : { head }) };
};
const pluralOf = (word) => {
    if (/[^aeiou]y$/.test(word))
        return `${word.slice(0, -1)}ies`;
    return /(s|x|z|ch|sh)$/.test(word) ? `${word}es` : `${word}s`;
};
const capitalized = (word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;
/** The words written the way the original name is written: camelCase, PascalCase, snake_case, SCREAMING_CASE or kebab-case. */
const spelled = (original, words) => {
    const isScreaming = original.includes("_") && original === original.toUpperCase();
    if (isScreaming)
        return words.join("_").toUpperCase();
    if (original.includes("_"))
        return words.join("_");
    if (original.includes("-"))
        return words.join("-");
    const [first = "", ...rest] = words;
    const isPascal = /^[A-Z]/.test(original);
    return [isPascal ? capitalized(first) : first, ...rest.map(capitalized)].join("");
};
/** The name with the matched phrase replaced by the term's words, keeping a plural plural: clients becomes customers. */
export const renamed = (read, match) => {
    const { term } = match.phrase.meaning;
    const matchedLast = read.words[match.end - 1] ?? "";
    const isPlural = matchedLast !== match.phrase.words.at(-1);
    const replacement = isPlural ? [...term.words.slice(0, -1), pluralOf(term.words.at(-1) ?? "")] : term.words;
    return spelled(read.text, [...read.words.slice(0, match.start), ...replacement, ...read.words.slice(match.end)]);
};
/** First words that make a name a question or a relation about its head, not the head itself: isCustomer, forCustomer. */
const relationWords = new Set([
    "is", "has", "have", "can", "should", "was", "were", "are", "does", "did", "will", "needs", "allows",
    "in", "into", "of", "for", "from", "to", "with", "without", "within", "by", "on", "per", "outside", "inside",
]);
/** Whether the name is about its head rather than one: isCodeFinding is a boolean, inLayers a selection. */
export const isAboutHead = (read) => read.words.length > 1 && relationWords.has(read.words[0] ?? "");
/** A term's definition as a sentence. */
export const definitionOf = (term) => `${term.definition.trim().replace(/[.\s]+$/, "")}.`;
//# sourceMappingURL=vocabulary.js.map