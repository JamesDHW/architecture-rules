import type { CheckResult } from "./checkResult.js";
import { renderReport } from "./markdownReport.js";
import { guidanceFor } from "./ruleGuidance.js";
import { renderAgent, renderJson, renderText } from "./textOutput.js";

/** How a check prints its result. */
export type OutputFormat = "text" | "json" | "report" | "agent";

/** What the baseline adds to a check's output: lines for text and agent output, data for JSON. */
export type GateReport = { readonly notes: readonly string[]; readonly details: Readonly<Record<string, unknown>> };

const noGate: GateReport = { notes: [], details: {} };

/** Renders the result in the format asked for. */
export const renderOutput = (root: string, result: CheckResult, format: OutputFormat, gate: GateReport = noGate): string => {
  const guidance = guidanceFor(root, result.findings.filter((finding) => finding.status !== "baselined"));
  switch (format) {
    case "report":
      return renderReport(result);
    case "json":
      return renderJson(result, guidance, gate.details);
    case "text":
      return renderText(result, guidance, gate.notes);
    case "agent":
      return renderAgent(result, guidance, gate.notes);
  }
};
