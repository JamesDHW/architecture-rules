import { isSamePhrase, wordsOf } from "../core/identifierWords.js";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { GLOSSARY_FIELDS, RESERVED_LAYER_NAMES, TERM_FIELDS } from "./configuration.constants.js";
import type { Glossary, GlossaryTerm, TermPhrase } from "./types.js";
import { checked, fields, optional, strings, text, type Checked } from "./validation.js";

const isTermName = (name: string): boolean => /^[A-Za-z][A-Za-z0-9]*$/.test(name);

const isTypeName = (name: string): boolean => /^[A-Za-z_$][\w$]*$/.test(name);

const isGlossaryName = (name: string): boolean => /^[A-Za-z][\w-]*$/.test(name) && !RESERVED_LAYER_NAMES.includes(name);

const phraseKey = (words: readonly string[]): string => words.join(" ");

const phrase = (value: string, label: string): Checked<TermPhrase> => {
  const words = wordsOf(value);
  return checked({ text: value, words }, words.length === 0 ? [`${label}: "${value}" has no words`] : []);
};

const duplicates = (keys: readonly string[]): readonly string[] => [...new Set(keys.filter((key, index) => keys.indexOf(key) !== index))];

type AvoidedIn = { readonly own: readonly string[]; readonly label: string };

const avoided = (value: unknown, { own, label }: AvoidedIn): Checked<readonly TermPhrase[]> => {
  const list = strings(value, label);
  const phrases = list.value.map((entry) => phrase(entry, label));
  const values = phrases.map((entry) => entry.value);
  const repeated = values.filter((entry, index) => values.slice(0, index).some((earlier) => isSamePhrase(earlier.words, entry.words)));
  const isOwn = values.some((entry) => isSamePhrase(entry.words, own));
  const kept = values.filter((entry) => !repeated.includes(entry) && !isSamePhrase(entry.words, own));
  return checked(kept, [
    ...list.issues, ...phrases.flatMap((entry) => entry.issues),
    ...(isOwn ? [`${label} must not include the term itself`] : []),
    ...repeated.map((entry) => `${label} lists "${entry.text}" twice`),
  ]);
};

const typeBinding = (value: unknown, label: string): Checked<string> => {
  const name = text(value, label);
  if (name.issues.length > 0) return name;
  return isTypeName(name.value) ? name : checked(name.value, [`${label} must be a type name, such as Customer`]);
};

const term = (value: unknown, { name, label }: { readonly name: string; readonly label: string }): Checked<GlossaryTerm> => {
  const input = fields(value, TERM_FIELDS, label);
  const words = wordsOf(name);
  const definition = text(input.value.definition, `${label}.definition`);
  const avoid = optional(input.value.avoid, (entry) => avoided(entry, { own: words, label: `${label}.avoid` }));
  const type = optional(input.value.type, (entry) => typeBinding(entry, `${label}.type`));
  return checked({
    name, words, definition: definition.value, avoid: avoid.value ?? [],
    ...(type.value === undefined ? {} : { type: type.value }),
  }, [
    ...(isTermName(name) ? [] : [`${label}: a term is written as a type name would be, such as Customer or LineItem`]),
    ...input.issues, ...definition.issues, ...avoid.issues, ...type.issues,
  ]);
};

/** A term or avoided alias, and where it comes from: the phrase a name could contain, and what it would mean. */
type Owner = { readonly words: readonly string[]; readonly glossary: string; readonly term: string; readonly alias?: string };

const ownersOf = (glossary: string, terms: readonly GlossaryTerm[]): readonly Owner[] => terms.flatMap((entry) => [
  { words: entry.words, glossary, term: entry.name },
  ...entry.avoid.map((alias) => ({ words: alias.words, glossary, term: entry.name, alias: alias.text })),
]);

const isSameOwner = (left: Owner) => (right: Owner): boolean => isSamePhrase(left.words, right.words);

const ownerLabel = (owner: Owner, withGlossary: boolean): string => {
  const where = withGlossary ? ` in ${owner.glossary}` : "";
  return owner.alias === undefined ? `the term ${owner.term}${where}` : `an avoided alias of ${owner.term}${where}`;
};

/** Phrases two entries claim, so a name using one would have two meanings: one issue per phrase. */
type CollisionsIn = { readonly label: string; readonly withGlossary: boolean };

const collisions = (owners: readonly Owner[], { label, withGlossary }: CollisionsIn): readonly string[] => {
  const groups = owners.filter((owner, index) => !owners.slice(0, index).some(isSameOwner(owner))).map((first) => owners.filter(isSameOwner(first)));
  return groups.filter((group) => group.length > 1).map((group) => {
    return `${label}: "${phraseKey(group[0]?.words ?? [])}" is ${group.map((owner) => ownerLabel(owner, withGlossary)).join(" and ")}; give each meaning one word`;
  });
};

const glossary = (name: string, value: unknown): Checked<Glossary> => {
  const label = `glossaries.${name}`;
  const input = fields(value, GLOSSARY_FIELDS, label);
  const description = optional(input.value.description, (entry) => text(entry, `${label}.description`));
  const { terms } = input.value;
  if (!isRecord(terms)) return checked({ terms: [] }, [...input.issues, `${label}.terms must be an object`]);
  const entries = Object.entries(terms).map(([termName, entry]) => term(entry, { name: termName, label: `${label}.terms.${termName}` }));
  const values = entries.map((entry) => entry.value);
  return checked({ ...(description.value === undefined ? {} : { description: description.value }), terms: values }, [
    ...input.issues, ...description.issues, ...entries.flatMap((entry) => entry.issues),
    ...(entries.length === 0 ? [`${label}.terms must define at least one term`] : []),
    ...(isGlossaryName(name) ? [] : [`${label}: a glossary name starts with a letter`]),
    ...collisions(ownersOf(name, values), { label, withGlossary: false }),
  ]);
};

/** The glossaries section: each glossary's terms, checked so no phrase has two meanings. */
export const glossaries = (value: unknown): Checked<Readonly<Record<string, Glossary>>> => {
  if (value === undefined) return checked({});
  if (!isRecord(value)) return checked({}, ["glossaries must be an object"]);
  const entries = Object.entries(value).map(([name, entry]) => ({ name, result: glossary(name, entry) }));
  return checked(Object.fromEntries(entries.map(({ name, result }) => [name, result.value])), entries.flatMap(({ result }) => result.issues));
};

const glossaryNames = (value: unknown, label: string): Checked<readonly string[]> => {
  if (isString(value)) return text(value, label).issues.length > 0 ? checked([], [`${label} must name a glossary`]) : checked([value]);
  if (!isUnknownArray(value)) return checked([], [`${label} must be a glossary name or a list of them`]);
  const names = strings(value, label);
  return checked(names.value, [...names.issues, ...duplicates(names.value).map((name) => `${label} lists ${name} twice`)]);
};

/**
 * The glossaries a layer follows. Each must exist, and together they must not give one phrase two meanings: a layer
 * that follows two glossaries reads both vocabularies at once.
 */
type LayerIn = { readonly known: Readonly<Record<string, Glossary>>; readonly label: string };

export const layerGlossaries = (value: unknown, { known, label }: LayerIn): Checked<readonly string[]> => {
  const names = glossaryNames(value, label);
  const unknown = names.value.filter((name) => known[name] === undefined);
  const owners = names.value.flatMap((name) => ownersOf(name, known[name]?.terms ?? []));
  const isCombined = names.value.length > 1;
  const crossGlossary = isCombined ? owners.filter((owner) => owners.some((other) => isSameOwner(owner)(other) && other.glossary !== owner.glossary)) : [];
  return checked(names.value.filter((name) => known[name] !== undefined), [
    ...names.issues,
    ...unknown.map((name) => `${label}: unknown glossary '${name}'`),
    ...collisions(crossGlossary, { label, withGlossary: true }),
  ]);
};
