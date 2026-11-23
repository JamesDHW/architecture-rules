import type { SourceFile } from "typescript/unstable/ast";
import type { Project, Type } from "typescript/unstable/sync";

import { isPresent } from "../../core/guards.js";
import type { Architecture, GlossaryTerm } from "../../config/types.js";
import type { ConfigText } from "../configurationChecks.js";
import type { OwnedName } from "./names.js";
import { declarationKeys } from "./types.js";
import type { ClassifiedFile, Issue } from "../inventory.js";

/** A file that follows a glossary, parsed once: its project, syntax tree and the names it declares. */
export type GlossaryFile = {
  readonly file: ClassifiedFile;
  readonly project: Project;
  readonly source: SourceFile;
  readonly names: readonly OwnedName[];
};

/** A bound term's type: its declarations, and its symbol to ask each project for the type. No keys when not found once. */
type Binding = { readonly keys: readonly string[]; readonly symbol?: NonNullable<ReturnType<Type["getSymbol"]>> };

/** Each bound term's type, by glossary and term: glossary:Term. */
export type Bindings = ReadonlyMap<string, Binding>;

export const bindingKey = (glossary: string, term: GlossaryTerm): string => `${glossary}:${term.name}`;

const escaped = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const lineAt = (text: string, offset: number): number => text.slice(0, offset).split("\n").length;

/** The line of a key in the configuration, searched for after another key: a term inside its glossary. */
const keyLine = (config: ConfigText, keys: readonly string[]): number | undefined => {
  const offsetFrom = (from: number, remaining: readonly string[]): number | undefined => {
    const [key, ...rest] = remaining;
    if (key === undefined) return from;
    const match = new RegExp(`["']?\\b${escaped(key)}\\b["']?\\s*:`).exec(config.text.slice(from));
    return match === null ? undefined : offsetFrom(from + match.index, rest);
  };
  const found = offsetFrom(0, keys);
  return found === undefined ? undefined : lineAt(config.text, found);
};

/** An issue about the glossary configuration, at the line of the glossary or the term it is about. */
type IssueAt = { readonly ruleId: string; readonly config: ConfigText; readonly keys: readonly string[]; readonly message: string };

export const glossaryIssue = ({ ruleId, config, keys, message }: IssueAt): Issue => {
  const line = keyLine(config, ["glossaries", ...keys]);
  return { ruleId, file: config.file, message, ...(line === undefined ? {} : { line }) };
};

type Declared = { readonly file: GlossaryFile; readonly name: OwnedName };

/** A term with a type, in the glossary that defines it. */
type BoundTerm = { readonly glossary: string; readonly term: GlossaryTerm; readonly typeName: string };

const declarationsOf = (files: readonly GlossaryFile[], { glossary, typeName }: BoundTerm): readonly Declared[] => files
  .filter(({ file }) => file.policy.glossaries.includes(glossary))
  .flatMap((file) => file.names.filter((name) => name.topLevelType === true && name.text === typeName).map((name) => ({ file, name })));

type Resolved = Binding & { readonly issue?: string };

const resolve = (files: readonly GlossaryFile[], bound: BoundTerm): Resolved => {
  const { glossary, term, typeName } = bound;
  const declared = declarationsOf(files, bound);
  const declaringFiles = [...new Set(declared.map(({ file }) => file.file.relative))];
  const where = `Glossary ${glossary} gives ${term.name} the type ${typeName}`;
  if (declaringFiles.length === 0) return { keys: [], issue: `${where}, but no layer that follows ${glossary} declares it at the top level of a file.` };
  if (declaringFiles.length > 1) return { keys: [], issue: `${where}, which is declared in ${declaringFiles.join(", ")}. Declare it once.` };
  const symbols = declared.flatMap(({ file, name }) => (name.node === undefined ? [] : [file.project.checker.getSymbolAtLocation(name.node)])).filter(isPresent);
  const [symbol] = symbols;
  return { keys: symbols.flatMap(declarationKeys), ...(symbol === undefined ? {} : { symbol }) };
};

type Bound = { readonly bindings: Bindings; readonly issues: readonly Issue[] };

/** What the glossary checks read: the configuration, and every file that follows a glossary. */
export type GlossaryInput = { readonly architecture: Architecture; readonly files: readonly GlossaryFile[]; readonly config: ConfigText };

/** Finds the one declaration of each bound term's type; a type declared nowhere or twice is an issue in the configuration. */
export const resolveBindings = ({ architecture, files, config }: GlossaryInput): Bound => {
  const resolved = Object.entries(architecture.glossaries).flatMap(([glossary, { terms }]) => terms.flatMap((term) => {
    if (term.type === undefined) return [];
    return [{ glossary, term, result: resolve(files, { glossary, term, typeName: term.type }) }];
  }));
  return {
    bindings: new Map(resolved.map(({ glossary, term, result }) => [bindingKey(glossary, term), { keys: result.keys, ...(result.symbol === undefined ? {} : { symbol: result.symbol }) }])),
    issues: resolved.flatMap(({ glossary, term, result }) => {
      return result.issue === undefined ? [] : [glossaryIssue({ ruleId: "glossary-types", config, keys: [glossary, term.name], message: result.issue })];
    }),
  };
};
