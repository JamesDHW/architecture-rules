import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { rules } from "../rules/index.js";
import type { Finding } from "../runner/findings.js";

/** The editor's diagnostic severities. */
const errorSeverity = 1;
const warningSeverity = 2;
const hintSeverity = 4;
/** The editor's tag for code to show faded. */
const unnecessaryTag = 1;

type Diagnostic = {
  readonly range: { readonly start: { readonly line: number; readonly character: number }; readonly end: { readonly line: number; readonly character: number } };
  readonly severity: number;
  readonly tags?: readonly number[];
  readonly code: string;
  readonly codeDescription?: { readonly href: string };
  readonly source: string;
  readonly message: string;
};

/** Diagnostics for one file, by its URI. */
export type FileDiagnostics = { readonly uri: string; readonly diagnostics: readonly Diagnostic[] };

const docsDirectory = new URL("../../docs/rules/", import.meta.url);

const ruleIds: ReadonlySet<string> = new Set(rules.map((rule) => rule.id));

/** The rule's documentation page; compiler errors and configuration errors have none. */
const documentation = (ruleId: string): { readonly codeDescription?: { readonly href: string } } => {
  if (!ruleIds.has(ruleId)) return {};
  return { codeDescription: { href: new URL(`${ruleId}.md`, docsDirectory).href } };
};

/**
 * Recorded debt in an untouched file is a faded hint; once the file is edited it becomes a warning, because the
 * change must fix it. Everything else keeps its severity.
 */
const severityOf = (finding: Finding): { readonly severity: number; readonly tags?: readonly number[] } => {
  switch (finding.status ?? "new") {
    case "baselined":
      return { severity: hintSeverity, tags: [unnecessaryTag] };
    case "touched":
      return { severity: warningSeverity };
    case "new":
      return { severity: finding.severity === "error" ? errorSeverity : warningSeverity };
  }
};

/** A finding exactly as the CLI reports it: same rule id, same message, at the same position; severity by status. */
const toDiagnostic = (finding: Finding): Diagnostic => {
  const line = Math.max(0, (finding.line ?? 1) - 1);
  const character = Math.max(0, (finding.column ?? 1) - 1);
  return {
    range: { start: { line, character }, end: { line, character } },
    ...severityOf(finding),
    code: finding.ruleId,
    ...documentation(finding.ruleId),
    source: "architecture",
    message: finding.message,
  };
};

/**
 * Groups findings by file. Files that had diagnostics before and have none now get an empty list, so the editor
 * clears them.
 */
export const fileDiagnostics = (root: string, findings: readonly Finding[], previous: ReadonlySet<string>): readonly FileDiagnostics[] => {
  const byFile = Map.groupBy(findings, (finding) => pathToFileURL(join(root, finding.file)).href);
  const cleared = [...previous].filter((uri) => !byFile.has(uri)).map((uri) => ({ uri, diagnostics: [] }));
  return [...[...byFile].map(([uri, group]) => ({ uri, diagnostics: group.map(toDiagnostic) })), ...cleared];
};
