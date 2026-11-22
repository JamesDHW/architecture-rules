import type { CheckResult } from "./checkResult.js";
/** How a check prints its result. */
export type OutputFormat = "text" | "json" | "report" | "agent";
/** What the baseline adds to a check's output: lines for text and agent output, data for JSON. */
export type GateReport = {
    readonly notes: readonly string[];
    readonly details: Readonly<Record<string, unknown>>;
};
/** Renders the result in the format asked for. */
export declare const renderOutput: (root: string, result: CheckResult, format: OutputFormat, gate?: GateReport) => string;
//# sourceMappingURL=output.d.ts.map