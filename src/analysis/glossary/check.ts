import type { Project } from "typescript/unstable/sync";

import { isPresent, isRecord } from "../../core/guards.js";
import type { Architecture } from "../../config/types.js";
import type { ConfigText } from "../configurationChecks.js";
import type { ClassifiedFile, Issue } from "../inventory.js";
import { resolveBindings, type Bindings, type GlossaryFile } from "./bindings.js";
import { aliasIssues, needsType, typeIssues, type Context, type Name, type NameIssue, type TermTypes } from "./nameIssues.js";
import { ownedNames } from "./names.js";
import { judgeType, type TermType } from "./types.js";
import { unusedIssues } from "./usage.js";
import { readName, vocabularyOf } from "./vocabulary.js";

/** Issues about the names in the checked files, and about the glossaries themselves. */
export type GlossaryResult = { readonly names: readonly NameIssue[]; readonly configuration: readonly Issue[] };

const isOn = (file: ClassifiedFile, ruleId: string): boolean => (file.policy.rules[ruleId]?.severity ?? "off") !== "off";

const aliasMatch = (file: ClassifiedFile): "head" | "any" => {
  const [option] = file.policy.rules["glossary-aliases"]?.options ?? [];
  const readsEveryWord = isRecord(option) && option.match === "any";
  return readsEveryWord ? "any" : "head";
};

const noTermTypes: TermTypes = new Map();

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
    const typedName = { name, typed: byName.get(name) };
    return [...aliasIssues(context, typedName), ...typeIssues(context, typedName)];
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
/** The configuration, every classified file, the TypeScript projects, and which files' names to report. */
export type GlossaryScope = {
  readonly architecture: Architecture;
  readonly files: readonly ClassifiedFile[];
  readonly projects: readonly Project[];
  readonly config: ConfigText;
  readonly checked: ReadonlySet<string>;
};

export const checkGlossaries = ({ architecture, files, projects, config, checked }: GlossaryScope): GlossaryResult => {
  const hasGlossaries = Object.keys(architecture.glossaries).length > 0;
  if (!hasGlossaries) return { names: [], configuration: [] };
  const parsed = files.filter(followsGlossary).map((file) => parse(file, projects)).filter(isPresent);
  const input = { architecture, files: parsed, config };
  const { bindings, issues } = resolveBindings(input);
  const byProject = new Map(projects.map((project) => [project, termTypesIn(project, bindings)]));
  const contextOf = (entry: GlossaryFile): Context => ({
    file: entry.file, checker: entry.project.checker, termTypes: byProject.get(entry.project) ?? noTermTypes,
    vocabulary: vocabularyOf(architecture, entry.file.policy.glossaries), match: aliasMatch(entry.file),
    types: isOn(entry.file, "glossary-types"), aliases: isOn(entry.file, "glossary-aliases"),
  });
  const names = parsed.filter(({ file }) => checked.has(file.relative)).flatMap((entry) => fileIssues(entry, contextOf(entry)));
  return { names, configuration: [...issues, ...unusedIssues(input)] };
};
