import { bindingKey, glossaryIssue } from "./bindings.js";
import { readName, vocabularyOf } from "./vocabulary.js";
/** The terms some name in the files uses, as glossary:Term. */
const usedTerms = (architecture, files) => new Set(files.flatMap(({ file, names }) => {
    const vocabulary = vocabularyOf(architecture, file.policy.glossaries);
    return names.flatMap((name) => readName(name.text, vocabulary).all)
        .filter((match) => match.phrase.meaning.alias === undefined)
        .map((match) => bindingKey(match.phrase.meaning.glossary, match.phrase.meaning.term));
}));
/** Glossaries no layer follows, and terms no name in the layers that follow them uses. */
export const unusedIssues = ({ architecture, files, config }) => {
    const followed = new Set(Object.values(architecture.layers).flatMap((layer) => layer.policy.glossaries));
    const used = usedTerms(architecture, files);
    return Object.entries(architecture.glossaries).flatMap(([glossary, { terms }]) => {
        if (!followed.has(glossary)) {
            const message = `Glossary ${glossary} is followed by no layer, so nothing checks it. Add it to a layer's glossary, or remove it.`;
            return [glossaryIssue({ ruleId: "unused-terms", config, keys: [glossary], message })];
        }
        return terms.filter((term) => !used.has(bindingKey(glossary, term))).map((term) => {
            const message = `Glossary ${glossary} defines ${term.name}, but no name in the layers that follow it uses it.`;
            return glossaryIssue({ ruleId: "unused-terms", config, keys: [glossary, term.name], message });
        });
    });
};
//# sourceMappingURL=usage.js.map