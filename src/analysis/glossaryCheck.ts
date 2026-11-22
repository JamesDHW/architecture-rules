import type { Checker, Project } from "typescript/unstable/sync";

import type { PhraseMatch } from "../core/identifierWords.js";
import { isPresent, isRecord } from "../core/guards.js";
import type { Architecture } from "../config/types.js";
import type { ConfigText } from "./configurationChecks.js";
import { bindingKey, glossaryIssue, resolveBindings, type Bindings, type GlossaryFile } from "./glossaryBindings.js";
import { ownedNames, type OwnedName } from "./glossaryNames.js";
import { judgeType, isOfTermType, reachesTermType, type JudgedType, type TermType } from "./glossaryTypes.js";
import { definitionOf, isAboutHead, readName, renamed, vocabularyOf, type Meaning, type ReadName, type Vocabulary } from "./glossaryVocabulary.js";
import type { ClassifiedFile, Issue } from "./inventory.js";

/** An issue about one name: where the name is declared, to the column. */
export type NameIssue = Issue & { readonly column?: number };

/** Issues about the names in the checked files, and about the glossaries themselves. */
export type GlossaryResult = { readonly names: readonly NameIssue[]; readonly configuration: readonly Issue[] };

/** Each bound term's type as one project's checker sees it, by glossary:Term. */
type TermTypes = ReadonlyMap<string, TermType>;

type Context = {
  readonly checker: Checker;
  readonly termTypes: TermTypes;
  readonly vocabulary: Vocabulary;
  readonly match: "head" | "any";
  readonly types: boolean;
  readonly aliases: boolean;
};

type Name = { readonly owned: OwnedName; readonly read: ReadName; readonly aliases: readonly PhraseMatch<Meaning>[] };

const isOn = (file: ClassifiedFile, ruleId: string): boolean => (file.policy.rules[ruleId]?.severity ?? "off") !== "off";

const aliasMatch = (file: ClassifiedFile): "head" | "any" => {
  const [option] = file.policy.rules["glossary-aliases"]?.options ?? [];
  const readsEveryWord = isRecord(option) && option.match === "any";
  return readsEveryWord ? "any" : "head";
};

const noType: TermType = { keys: [] };

const noTermTypes: TermTypes = new Map();

const termTypeOf = (context: Context, meaning: Meaning): TermType => context.termTypes.get(bindingKey(meaning.glossary, meaning.term)) ?? noType;

const isBound = (context: Context, meaning: Meaning): boolean => termTypeOf(context, meaning).keys.length > 0;

const headTerm = (read: ReadName): Meaning | undefined => {
  const meaning = read.head?.phrase.meaning;
  return meaning?.alias === undefined ? meaning : undefined;
};

/** Whether the name's type matters: it is a value, and a typed term or an alias of one appears where the checks read. */
const needsType = (context: Context, name: Name): boolean => {
  const isChecked = context.types || context.aliases;
  const isUntypedName = name.owned.kind !== "value" || !isChecked;
  if (isUntypedName) return false;
  const hasBindings = [...context.termTypes.values()].some((termType) => termType.keys.length > 0);
  return name.aliases.some((match) => isBound(context, match.phrase.meaning)) || (hasBindings && headTerm(name.read) !== undefined);
};

const at = (file: ClassifiedFile, owned: OwnedName, ruleId: string, message: string): NameIssue => ({
  ruleId, file: file.relative, message,
  ...(owned.line === undefined ? {} : { line: owned.line }), ...(owned.column === undefined ? {} : { column: owned.column }),
});

/** A value whose type is some other object type is a different thing that shares the word: client: HttpClient. */
const isOtherThing = (context: Context, judged: JudgedType | undefined, termType: TermType): boolean => {
  if (judged === undefined) return false;
  const isTermType = termType.keys.length === 0 || isOfTermType(context.checker, judged, termType);
  if (isTermType) return false;
  const isObjectOnly = judged.object && !judged.primitive && !judged.indeterminate;
  return isObjectOnly;
};

const aliasIssues = (file: ClassifiedFile, context: Context, name: Name, judged: JudgedType | undefined): readonly NameIssue[] => {
  if (!context.aliases) return [];
  // The type describes what the name names, its head; a qualifier such as client in clientOrders is not excused by it.
  const isHead = (match: PhraseMatch<Meaning>): boolean => match.start === name.read.head?.start && match.end === name.read.head.end;
  const isExcused = (match: PhraseMatch<Meaning>): boolean => isHead(match) && isOtherThing(context, judged, termTypeOf(context, match.phrase.meaning));
  return name.aliases.filter((match) => !isExcused(match)).map((match) => {
    const { term, alias } = match.phrase.meaning;
    const message = `${name.owned.text} says "${alias?.text ?? ""}", a word the glossary avoids for ${term.name}: ${definitionOf(term)} Rename it to ${renamed(name.owned.text, name.read, match)}.`;
    return at(file, name.owned, "glossary-aliases", message);
  });
};

type Typed = { readonly judged: JudgedType; readonly text: string };

const typeIssues = (file: ClassifiedFile, context: Context, name: Name, typed: Typed | undefined): readonly NameIssue[] => {
  const meaning = headTerm(name.read);
  const isJudged = context.types && meaning !== undefined && typed !== undefined && !isAboutHead(name.read);
  if (!isJudged) return [];
  const own = termTypeOf(context, meaning);
  if (isOfTermType(context.checker, typed.judged, own)) return [];
  const isOtherTerm = (candidate: Meaning): boolean => candidate.alias === undefined && candidate.term !== meaning.term;
  // Accusing a name of meaning another term takes a reference to that term's type, not a shape that happens to fit it.
  const other = context.vocabulary.map((phrase) => phrase.meaning).filter(isOtherTerm)
    .find((candidate) => reachesTermType(typed.judged, termTypeOf(context, candidate)));
  if (other !== undefined) {
    const message = `${name.owned.text} has type ${other.term.type ?? other.term.name}, but ${meaning.term.name} means: ${definitionOf(meaning.term)} Name it after ${other.term.name}.`;
    return [at(file, name.owned, "glossary-types", message)];
  }
  const isWrongType = own.keys.length > 0 && !typed.judged.indeterminate;
  if (!isWrongType) return [];
  const message = `${name.owned.text} is named after ${meaning.term.name} but has type ${typed.text}. ${meaning.term.name}: ${definitionOf(meaning.term)} Give it type ${meaning.term.type ?? meaning.term.name}, or rename it to say what it is.`;
  return [at(file, name.owned, "glossary-types", message)];
};

const fileIssues = (entry: GlossaryFile, context: Context): readonly NameIssue[] => {
  const names = entry.names.map((owned): Name => {
    const read = readName(owned.text, context.vocabulary);
    const candidates = context.match === "any" ? read.all : [read.head].filter(isPresent);
    return { owned, read, aliases: candidates.filter((match) => match.phrase.meaning.alias !== undefined) };
  }).filter((name) => name.read.all.length > 0);
  const typed = names.flatMap((name) => {
    const { node } = name.owned;
    if (node === undefined) return [];
    return needsType(context, name) ? [{ name, node }] : [];
  });
  const { checker } = context;
  const types = typed.length === 0 ? [] : checker.getTypeAtLocation(typed.map(({ node }) => node));
  const byName = new Map(typed.map(({ name }, index) => {
    const type = types[index];
    return [name, { judged: judgeType(checker, type), text: type === undefined ? "unknown" : checker.typeToString(type) }] as const;
  }));
  return names.flatMap((name) => {
    const found = byName.get(name);
    return [...aliasIssues(entry.file, context, name, found?.judged), ...typeIssues(entry.file, context, name, found)];
  });
};

/** The terms some name in the files uses, as glossary:Term. */
const usedTerms = (architecture: Architecture, files: readonly GlossaryFile[]): ReadonlySet<string> => new Set(files.flatMap(({ file, names }) => {
  const vocabulary = vocabularyOf(architecture, file.policy.glossaries);
  return names.flatMap((name) => readName(name.text, vocabulary).all)
    .filter((match) => match.phrase.meaning.alias === undefined)
    .map((match) => bindingKey(match.phrase.meaning.glossary, match.phrase.meaning.term));
}));

const unusedIssues = (architecture: Architecture, files: readonly GlossaryFile[], config: ConfigText): readonly Issue[] => {
  const followed = new Set(Object.values(architecture.layers).flatMap((layer) => layer.policy.glossaries));
  const used = usedTerms(architecture, files);
  return Object.entries(architecture.glossaries).flatMap(([glossary, { terms }]) => {
    if (!followed.has(glossary)) return [glossaryIssue("unused-terms", config, [glossary], `Glossary ${glossary} is followed by no layer, so nothing checks it. Add it to a layer's glossary, or remove it.`)];
    return terms.filter((term) => !used.has(bindingKey(glossary, term)))
      .map((term) => glossaryIssue("unused-terms", config, [glossary, term.name], `Glossary ${glossary} defines ${term.name}, but no name in the layers that follow it uses it.`));
  });
};

/** Each bound term's type in one project: asked only where the project holds the file that declares it. */
const termTypesIn = (project: Project, bindings: Bindings): TermTypes => new Map([...bindings].map(([key, binding]): readonly [string, TermType] => {
  const { symbol, keys } = binding;
  const declaration = symbol?.declarations.at(0);
  const declaringSource = declaration === undefined ? undefined : project.program.getSourceFile(declaration.path);
  const isOutsideProject = symbol === undefined || declaringSource === undefined;
  if (isOutsideProject) return [key, { keys }];
  return [key, { keys, type: project.checker.getDeclaredTypeOfSymbol(symbol) }];
}));

const parse = (file: ClassifiedFile, projects: readonly Project[]): GlossaryFile | undefined => {
  const found = projects.map((project) => ({ project, source: project.program.getSourceFile(file.path) })).find(({ source }) => source !== undefined);
  if (found?.source === undefined) return undefined;
  return { file, project: found.project, source: found.source, names: ownedNames(found.source) };
};

const followsGlossary = (file: ClassifiedFile): boolean => file.policy.glossaries.length > 0 && file.policy.generated === undefined;

/**
 * The glossary checks. Every file that follows a glossary is read, since a term's type and a term's use can be
 * anywhere in its layers; names are checked only in the checked files, and types are asked only for names that use
 * a glossary's words.
 */
export const checkGlossaries = (architecture: Architecture, files: readonly ClassifiedFile[], projects: readonly Project[], config: ConfigText, checked: ReadonlySet<string>): GlossaryResult => {
  const hasGlossaries = Object.keys(architecture.glossaries).length > 0;
  if (!hasGlossaries) return { names: [], configuration: [] };
  const parsed = files.filter(followsGlossary).map((file) => parse(file, projects)).filter(isPresent);
  const { bindings, issues } = resolveBindings(architecture, parsed, config);
  const byProject = new Map(projects.map((project) => [project, termTypesIn(project, bindings)]));
  const contextOf = (entry: GlossaryFile): Context => ({
    checker: entry.project.checker, termTypes: byProject.get(entry.project) ?? noTermTypes,
    vocabulary: vocabularyOf(architecture, entry.file.policy.glossaries), match: aliasMatch(entry.file),
    types: isOn(entry.file, "glossary-types"), aliases: isOn(entry.file, "glossary-aliases"),
  });
  const names = parsed.filter(({ file }) => checked.has(file.relative)).flatMap((entry) => fileIssues(entry, contextOf(entry)));
  return { names, configuration: [...issues, ...unusedIssues(architecture, parsed, config)] };
};
