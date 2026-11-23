import type { Node, SourceFile } from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";

import { isPresent, isRecord } from "../../core/guards.js";
import type { Architecture, EffectiveRule } from "../../config/types.js";
import type { ClassifiedFile } from "../inventory.js";

/** A classified file with the project and syntax tree the compiler built for it. */
export type ProgramFile = { readonly file: ClassifiedFile; readonly project: Project; readonly source: SourceFile };

/** What a program check reads: the architecture, the files to check and the compiler's projects. */
export type ProgramScope = { readonly architecture: Architecture; readonly files: readonly ClassifiedFile[]; readonly projects: readonly Project[] };

/** One problem a program check found, at the severity the file's layer sets. */
export type ProgramIssue = {
  readonly ruleId: string;
  readonly file: string;
  readonly line?: number;
  readonly severity: "error" | "warn";
  readonly message: string;
};

/** Which rule's setting to read, for which file. */
export type RuleLookup = { readonly file: ClassifiedFile; readonly ruleId: string };

const settingOf = (architecture: Architecture, { file, ruleId }: RuleLookup): EffectiveRule | undefined => {
  return file.policy.rules[ruleId] ?? architecture.defaults.rules[ruleId];
};

/** The rule's severity for a file: its layer's, else the project's; undefined when the rule is off there. */
export const severityOf = (architecture: Architecture, lookup: RuleLookup): "error" | "warn" | undefined => {
  const severity = settingOf(architecture, lookup)?.severity;
  return severity === "off" ? undefined : severity;
};

/** The rule's first option object for a file, or an empty record. */
export const optionsOf = (architecture: Architecture, lookup: RuleLookup): Readonly<Record<string, unknown>> => {
  const [options] = settingOf(architecture, lookup)?.options ?? [];
  return isRecord(options) ? options : {};
};

/** Production source: shipped code that a person wrote, not tests, scripts, generated output or declarations. */
export const isProductionSource = (file: ClassifiedFile): boolean => {
  const isDeclaration = /\.d\.[cm]?ts$/.test(file.relative);
  const isWritten = file.policy.generated === undefined && !isDeclaration;
  return !file.policy.development && isWritten;
};

const programFile = (projects: readonly Project[], file: ClassifiedFile): ProgramFile | undefined => {
  const found = projects.map((project) => ({ project, source: project.program.getSourceFile(file.path) })).find((entry) => entry.source !== undefined);
  if (found?.source === undefined) return undefined;
  return { file, project: found.project, source: found.source };
};

/** Each file with its project and syntax tree; files the compiler does not hold are skipped. */
export const programFiles = (projects: readonly Project[], files: readonly ClassifiedFile[]): readonly ProgramFile[] => {
  return files.map((file) => programFile(projects, file)).filter(isPresent);
};

/** The 1-based line a node starts on. */
export const lineOf = (source: SourceFile, node: Node): number => source.text.slice(0, node.getStart(source)).split("\n").length;
