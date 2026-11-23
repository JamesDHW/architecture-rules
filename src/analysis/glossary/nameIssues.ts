import type { Checker } from "typescript/unstable/sync";

import type { PhraseMatch } from "../../core/identifierWords.js";
import type { ClassifiedFile, Issue } from "../inventory.js";
import { bindingKey } from "./bindings.js";
import type { OwnedName } from "./names.js";
import { isOfTermType, reachesTermType, type JudgedType, type TermType } from "./types.js";
import { definitionOf, isAboutHead, renamed, type Meaning, type ReadName, type Vocabulary } from "./vocabulary.js";

/** An issue about one name: where the name is declared, to the column. */
export type NameIssue = Issue & { readonly column?: number };

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

export type Name = { readonly owned: OwnedName; readonly read: ReadName; readonly aliases: readonly PhraseMatch<Meaning>[] };

const noType: TermType = { keys: [] };

const termTypeOf = (context: Context, meaning: Meaning): TermType => context.termTypes.get(bindingKey(meaning.glossary, meaning.term)) ?? noType;

const isBound = (context: Context, meaning: Meaning): boolean => termTypeOf(context, meaning).keys.length > 0;

const headTerm = (read: ReadName): Meaning | undefined => {
  const meaning = read.head?.phrase.meaning;
  return meaning?.alias === undefined ? meaning : undefined;
};

/** Whether the name's type matters: it is a value, and a typed term or an alias of one appears where the checks read. */
export const needsType = (context: Context, name: Name): boolean => {
  const isChecked = context.types || context.aliases;
  const isUntypedName = name.owned.kind !== "value" || !isChecked;
  if (isUntypedName) return false;
  const hasBindings = [...context.termTypes.values()].some((termType) => termType.keys.length > 0);
  return name.aliases.some((match) => isBound(context, match.phrase.meaning)) || (hasBindings && headTerm(name.read) !== undefined);
};

type Found = { readonly owned: OwnedName; readonly ruleId: string; readonly message: string };

const at = (file: ClassifiedFile, { owned, ruleId, message }: Found): NameIssue => ({
  ruleId, file: file.relative, message,
  ...(owned.line === undefined ? {} : { line: owned.line }), ...(owned.column === undefined ? {} : { column: owned.column }),
});

/** A value whose type is some other object type is a different thing that shares the word: client: HttpClient. */
type Against = { readonly judged: JudgedType | undefined; readonly termType: TermType };

const isOtherThing = (context: Context, { judged, termType }: Against): boolean => {
  if (judged === undefined) return false;
  const isTermType = termType.keys.length === 0 || isOfTermType(context.checker, { judged, term: termType });
  if (isTermType) return false;
  const isObjectOnly = judged.object && !judged.primitive && !judged.indeterminate;
  return isObjectOnly;
};

type Typed = { readonly judged: JudgedType; readonly text: string };

/** A name and, when its type was asked for, what the type says. */
type TypedName = { readonly name: Name; readonly typed: Typed | undefined };

export const aliasIssues = (context: Context, { name, typed }: TypedName): readonly NameIssue[] => {
  if (!context.aliases) return [];
  const judged = typed?.judged;
  // The type describes what the name names, its head; a qualifier such as client in clientOrders is not excused by it.
  const isHead = (match: PhraseMatch<Meaning>): boolean => match.start === name.read.head?.start && match.end === name.read.head.end;
  const isExcused = (match: PhraseMatch<Meaning>): boolean => isHead(match) && isOtherThing(context, { judged, termType: termTypeOf(context, match.phrase.meaning) });
  return name.aliases.filter((match) => !isExcused(match)).map((match) => {
    const { term, alias } = match.phrase.meaning;
    const message = `${name.owned.text} says "${alias?.text ?? ""}", a word the glossary avoids for ${term.name}: ${definitionOf(term)} Rename it to ${renamed(name.read, match)}.`;
    return at(context.file, { owned: name.owned, ruleId: "glossary-aliases", message });
  });
};

export const typeIssues = (context: Context, { name, typed }: TypedName): readonly NameIssue[] => {
  const meaning = headTerm(name.read);
  const isJudged = context.types && meaning !== undefined && typed !== undefined && !isAboutHead(name.read);
  if (!isJudged) return [];
  const own = termTypeOf(context, meaning);
  if (isOfTermType(context.checker, { judged: typed.judged, term: own })) return [];
  const isOtherTerm = (candidate: Meaning): boolean => candidate.alias === undefined && candidate.term !== meaning.term;
  // Accusing a name of meaning another term takes a reference to that term's type, not a shape that happens to fit it.
  const other = context.vocabulary.map((phrase) => phrase.meaning).filter(isOtherTerm)
    .find((candidate) => reachesTermType(typed.judged, termTypeOf(context, candidate)));
  if (other !== undefined) {
    const message = `${name.owned.text} has type ${other.term.type ?? other.term.name}, but ${meaning.term.name} means: ${definitionOf(meaning.term)} Name it after ${other.term.name}.`;
    return [at(context.file, { owned: name.owned, ruleId: "glossary-types", message })];
  }
  const isWrongType = own.keys.length > 0 && !typed.judged.indeterminate;
  if (!isWrongType) return [];
  const message = `${name.owned.text} is named after ${meaning.term.name} but has type ${typed.text}. ${meaning.term.name}: ${definitionOf(meaning.term)} Give it type ${meaning.term.type ?? meaning.term.name}, or rename it to say what it is.`;
  return [at(context.file, { owned: name.owned, ruleId: "glossary-types", message })];
};
