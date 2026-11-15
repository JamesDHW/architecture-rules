import { type CheckResult } from "./checkResult.js";
/** How a check prints its result. */
export type OutputFormat = "text" | "json" | "report";
/** Prints the result and returns the exit code: 1 when any error was found, except for the report, which always exits 0. */
export declare const printOutput: (root: string, result: CheckResult, format: OutputFormat) => number;
//# sourceMappingURL=output.d.ts.map