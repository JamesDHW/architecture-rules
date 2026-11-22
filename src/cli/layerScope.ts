import type { ImportIssue } from "../analysis/imports.js";
import type { Architecture } from "../config/types.js";
import type { CheckResult } from "../runner/checkResult.js";
import type { Finding } from "../runner/findings.js";

export const unknownLayers = (architecture: Architecture, layers: readonly string[]): readonly string[] => {
  return layers.filter((layer) => architecture.layers[layer] === undefined);
};

/** The import issue a lint finding reports: the engine repeats the issue's message and line. */
const issueFor = (issues: readonly ImportIssue[], finding: Finding): ImportIssue | undefined => {
  return issues.find((issue) => issue.file === finding.file && issue.line === finding.line && finding.message.startsWith(issue.message));
};

const layerOf = (result: CheckResult): ((file: string) => string | undefined) => {
  const layers = new Map(result.files.map((file) => [file.relative, file.layer]));
  return (file) => layers.get(file);
};

/**
 * The findings the layers own: those in their files. With incoming, instead the denied imports from other layers'
 * files into these layers: who reaches in.
 */
export const layerFindings = (result: CheckResult, layers: readonly string[], incoming: boolean): readonly Finding[] => {
  const wanted = new Set(layers);
  const layer = layerOf(result);
  const owned = (finding: Finding): boolean => wanted.has(layer(finding.file) ?? "");
  if (!incoming) return result.findings.filter(owned);
  const issues = result.imports?.issues ?? [];
  return result.findings.filter((finding) => {
    const target = issueFor(issues, finding)?.target;
    const isIncoming = target !== undefined && wanted.has(target.layer);
    return isIncoming && !owned(finding);
  });
};
