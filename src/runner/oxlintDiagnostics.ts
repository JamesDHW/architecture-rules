import { resolve } from "node:path";

import { relativePath } from "../analysis/paths.js";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
import { diagnosticCode, lintRuleName } from "../rules/lintNames.js";
import { rules } from "../rules/index.js";
import type { Finding } from "./findings.js";

/** Architecture rule ids by the code Oxlint prints for them, such as typescript(no-misused-promises). */
const ruleIdsByCode = new Map(rules.flatMap((rule): readonly (readonly [string, string])[] => {
  const name = lintRuleName(rule);
  return name === undefined ? [] : [[diagnosticCode(name), rule.id]];
}));

const firstSpan = (labels: unknown): Readonly<Record<string, unknown>> | undefined => {
  if (!isUnknownArray(labels)) return undefined;
  const [label] = labels;
  if (!isRecord(label)) return undefined;
  const span = label["span"];
  return isRecord(span) ? span : undefined;
};

const position = (labels: unknown): { readonly line?: number; readonly column?: number } => {
  const span = firstSpan(labels);
  const line = span?.["line"];
  const column = span?.["column"];
  return { ...(typeof line === "number" ? { line } : {}), ...(typeof column === "number" ? { column } : {}) };
};

const toFinding = (root: string, diagnostic: unknown): Finding | undefined => {
  if (!isRecord(diagnostic)) return undefined;
  const { message, code, severity, filename, labels } = diagnostic;
  const hasText = isString(message) && isString(filename);
  if (!hasText) return undefined;
  const label = isString(code) ? code : "lint";
  return {
    source: "lint",
    severity: severity === "warning" ? "warning" : "error",
    ruleId: ruleIdsByCode.get(label) ?? label,
    file: relativePath(root, resolve(root, filename)),
    ...position(labels),
    message,
  };
};

/** Findings from one lint run printed with --format json, under architecture rule ids. */
export const parseOxlintOutput = (root: string, output: string): readonly Finding[] | ArchitectureError => {
  const parsed = tryCatch((): unknown => JSON.parse(output));
  if (parsed instanceof ArchitectureError) return new ArchitectureError([`The lint engine printed output that is not JSON: ${output.slice(0, 200)}`]);
  const diagnostics = isRecord(parsed) ? parsed["diagnostics"] : undefined;
  if (!isUnknownArray(diagnostics)) return new ArchitectureError(["The lint engine's JSON output has no diagnostics list"]);
  return diagnostics.flatMap((diagnostic) => toFinding(root, diagnostic) ?? []);
};
